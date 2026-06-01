import 'zone.js';

type ZoneLike = {
  name?: string;
  run<T>(callback: () => T): T;
  fork?: (spec: {name: string; properties?: Record<string, unknown>}) => ZoneLike;
};

type ZoneGlobal = {
  current?: ZoneLike;
};

export interface CreateModZoneOptions {
  name?: string;
  prefix?: string;
  properties?: Record<string, unknown>;
  onError?: ModZoneErrorReporter;
  rethrowErrors?: boolean;
}

export interface ModZoneErrorContext {
  zoneName: string;
  phase: 'runGuarded' | 'wrap';
  args?: readonly unknown[];
}

export type ModZoneErrorReporter = (error: unknown, context: ModZoneErrorContext) => void;

export interface ModZoneGuardOptions<T = unknown> {
  onError?: ModZoneErrorReporter;
  rethrow?: boolean;
  fallback?: T | (() => T);
}

export interface ModZoneWrapOptions<TResult = unknown> extends ModZoneGuardOptions<TResult> {
  outer?: boolean;
  guarded?: boolean;
}

export interface ModZone {
  readonly name: string;
  readonly enabled: boolean;
  run<T>(callback: () => T): T;
  runIn<T>(callback: () => T): T;
  runOuter<T>(callback: () => T): T;
  runGuarded<T>(callback: () => T, options?: ModZoneGuardOptions<T>): T | undefined;
  wrap<TArgs extends any[], TResult>(
    callback: (...args: TArgs) => TResult,
    options?: ModZoneWrapOptions<TResult>
  ): (...args: TArgs) => TResult | undefined;
  fork(name: string, options?: Omit<CreateModZoneOptions, 'name'>): ModZone;
}

const DEFAULT_ZONE_NAME = 'mod';
const DEFAULT_PREFIX = 'PortableUiMod';

function getCurrentZone(): ZoneLike | null {
  const zoneCtor = (globalThis as typeof globalThis & {Zone?: ZoneGlobal}).Zone;
  if (!zoneCtor?.current || typeof zoneCtor.current.run !== 'function') {
    return null;
  }

  return zoneCtor.current;
}

function runDirect<T>(callback: () => T): T {
  return callback();
}

function defaultErrorReporter(error: unknown, context: ModZoneErrorContext): void {
  console.error(`[PortableUi ModZone Error][${context.zoneName}]`, error, context);
}

function resolveFallback<T>(fallback: ModZoneGuardOptions<T>['fallback']): T | undefined {
  if (typeof fallback === 'function') {
    return (fallback as () => T)();
  }

  return fallback;
}

function normalizeOptions(options: string | CreateModZoneOptions | undefined): Required<CreateModZoneOptions> {
  if (typeof options === 'string') {
    return {
      name: options,
      prefix: DEFAULT_PREFIX,
      properties: {},
      onError: defaultErrorReporter,
      rethrowErrors: false,
    };
  }

  return {
    name: options?.name?.trim() || DEFAULT_ZONE_NAME,
    prefix: options?.prefix?.trim() || DEFAULT_PREFIX,
    properties: options?.properties ?? {},
    onError: options?.onError ?? defaultErrorReporter,
    rethrowErrors: options?.rethrowErrors ?? false,
  };
}

export function createModZone(options?: string | CreateModZoneOptions): ModZone {
  const normalized = normalizeOptions(options);
  const zoneName = normalized.prefix
    ? `${normalized.prefix}:${normalized.name}`
    : normalized.name;
  const outerZone = getCurrentZone();
  const defaultOnError = normalized.onError ?? defaultErrorReporter;
  const defaultRethrow = normalized.rethrowErrors ?? false;

  const createRunGuarded = (
    runScope: <T>(callback: () => T) => T,
    getContext: () => ModZoneErrorContext
  ) => {
    return <T>(callback: () => T, options?: ModZoneGuardOptions<T>): T | undefined => {
      try {
        return runScope(callback);
      } catch (error) {
        const reporter = options?.onError ?? defaultOnError;
        reporter(error, getContext());
        if (options?.rethrow ?? defaultRethrow) {
          throw error;
        }
        return resolveFallback(options?.fallback);
      }
    };
  };

  const createWrap = (
    runScope: <T>(callback: () => T) => T,
    getContext: (args?: readonly unknown[]) => ModZoneErrorContext
  ) => {
    return <TArgs extends any[], TResult>(
      callback: (...args: TArgs) => TResult,
      options?: ModZoneWrapOptions<TResult>
    ): ((...args: TArgs) => TResult | undefined) => {
      const guarded = options?.guarded ?? true;
      return function wrapped(this: unknown, ...args: TArgs): TResult | undefined {
        const invoke = () => callback.apply(this, args);
        if (!guarded) {
          return runScope(invoke);
        }

        try {
          return runScope(invoke);
        } catch (error) {
          const reporter = options?.onError ?? defaultOnError;
          reporter(error, getContext(args));
          if (options?.rethrow ?? defaultRethrow) {
            throw error;
          }
          return resolveFallback(options?.fallback) as TResult | undefined;
        }
      };
    };
  };

  if (!outerZone?.fork) {
    const runGuarded = createRunGuarded(runDirect, () => ({
      zoneName,
      phase: 'runGuarded',
    }));
    const wrapDirect = createWrap(runDirect, (args) => ({
        zoneName,
        phase: 'wrap',
        ...(args ? {args} : {}),
      }));
    return {
      name: zoneName,
      enabled: false,
      run: runDirect,
      runIn: runDirect,
      runOuter: runDirect,
      runGuarded,
      wrap(callback, options) {
        return wrapDirect(callback, options);
      },
      fork(name, nextOptions) {
        return createModZone({
          ...nextOptions,
          name,
          prefix: nextOptions?.prefix ?? zoneName,
        });
      },
    };
  }

  const innerZone = outerZone.fork({
    name: zoneName,
    ...(Object.keys(normalized.properties).length > 0 ? {properties: normalized.properties} : {}),
  });

  const runIn = <T>(callback: () => T): T => innerZone.run(callback);
  const runOuter = <T>(callback: () => T): T => outerZone.run(callback);
  const runGuarded = createRunGuarded(runIn, () => ({
    zoneName,
    phase: 'runGuarded',
  }));

  const wrapIn = createWrap(
    runIn,
    (args) => ({
      zoneName,
      phase: 'wrap',
      ...(args ? {args} : {}),
    })
  );
  const wrapOuter = createWrap(
    runOuter,
    (args) => ({
      zoneName,
      phase: 'wrap',
      ...(args ? {args} : {}),
    })
  );

  return {
    name: zoneName,
    enabled: true,
    run: runIn,
    runIn,
    runOuter,
    runGuarded,
    wrap(callback, options) {
      if (options?.outer) {
        return wrapOuter(callback, options);
      }
      return wrapIn(callback, options);
    },
    fork(name, nextOptions) {
      return runIn(() => createModZone({
        ...nextOptions,
        name,
        prefix: nextOptions?.prefix ?? zoneName,
      }));
    },
  };
}

