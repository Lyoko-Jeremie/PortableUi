import 'zone.js';

/**
 * Minimal Zone contract used by this helper.
 * Keep it intentionally narrow so the helper does not depend on full zone typings.
 */
type ZoneLike = {
  name?: string;
  run<T>(callback: () => T): T;
  fork?: (spec: {name: string; properties?: Record<string, unknown>}) => ZoneLike;
};

type ZoneGlobal = {
  current?: ZoneLike;
};

/** Options for creating a mod-specific zone facade. */
export interface CreateModZoneOptions {
  name?: string;
  prefix?: string;
  properties?: Record<string, unknown>;
  onError?: ModZoneErrorReporter;
  rethrowErrors?: boolean;
}

/** Structured metadata passed to mod error reporters. */
export interface ModZoneErrorContext {
  zoneName: string;
  phase: 'runGuarded' | 'wrap';
  args?: readonly unknown[];
}

export type ModZoneErrorReporter = (error: unknown, context: ModZoneErrorContext) => void;

/**
 * Error policy for guarded execution.
 * - onError: custom sink for observability.
 * - rethrow: fail-fast when needed.
 * - fallback: return value when error is swallowed.
 */
export interface ModZoneGuardOptions<T = unknown> {
  onError?: ModZoneErrorReporter;
  rethrow?: boolean;
  fallback?: T | (() => T);
}

/** Wrapper options for external callbacks. */
export interface ModZoneWrapOptions<TResult = unknown> extends ModZoneGuardOptions<TResult> {
  outer?: boolean;
  guarded?: boolean;
}

/**
 * Public mod-zone facade.
 * API remains available even when Zone is unavailable (graceful no-op mode).
 */
export interface ModZone {
  readonly name: string;
  readonly enabled: boolean;
  /** Alias of runIn. */
  run<T>(callback: () => T): T;
  /** Run logic inside the mod zone. */
  runIn<T>(callback: () => T): T;
  /** Run logic inside the outer zone captured at create-time. */
  runOuter<T>(callback: () => T): T;
  /** Guard execution with centralized error reporting and optional fallback. */
  runGuarded<T>(callback: () => T, options?: ModZoneGuardOptions<T>): T | undefined;
  /**
   * Wrap external callbacks so they execute in the desired zone with optional guard policy.
   * The wrapper preserves original `this` and arguments.
   */
  wrap<TArgs extends any[], TResult>(
    callback: (...args: TArgs) => TResult,
    options?: ModZoneWrapOptions<TResult>
  ): (...args: TArgs) => TResult | undefined;
  /** Create a child mod zone under current zone context. */
  fork(name: string, options?: Omit<CreateModZoneOptions, 'name'>): ModZone;
}

const DEFAULT_ZONE_NAME = 'mod';
const DEFAULT_PREFIX = 'PortableUiMod';

/** Returns the current zone if zone.js is active, otherwise null. */
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

/** Default error reporter used when callers do not provide one. */
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
  // Normalize once so all branches share identical defaults.
  const normalized = normalizeOptions(options);
  const zoneName = normalized.prefix
    ? `${normalized.prefix}:${normalized.name}`
    : normalized.name;
  const outerZone = getCurrentZone();
  const defaultOnError = normalized.onError ?? defaultErrorReporter;
  const defaultRethrow = normalized.rethrowErrors ?? false;

  // Factory for guarded methods (runGuarded).
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

  // Factory for wrapper methods (wrap) used by external event APIs.
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
        // Preserve caller context and args.
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

  // Graceful fallback: Zone API is missing, keep the same facade behavior.
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

  // Normal mode: fork one dedicated inner zone for this mod instance.
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
      // Some integrations need explicit outer-zone execution.
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

