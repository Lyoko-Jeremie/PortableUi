import 'zone.js';

/**
 * 本工具使用的最小 Zone 契约。
 * 这里故意保持类型收敛，避免依赖 zone.js 的完整类型定义。
 */
type ZoneLike = {
  name?: string;
  run<T>(callback: () => T): T;
  fork?: (spec: {name: string; properties?: Record<string, unknown>}) => ZoneLike;
};

type ZoneGlobal = {
  current?: ZoneLike;
};

/** 创建 mod 专属 zone 门面的配置项。 */
export interface CreateModZoneOptions {
  name?: string;
  prefix?: string;
  properties?: Record<string, unknown>;
  onError?: ModZoneErrorReporter;
  rethrowErrors?: boolean;
}

/** 传给 mod 错误上报器的结构化上下文信息。 */
export interface ModZoneErrorContext {
  zoneName: string;
  phase: 'runGuarded' | 'wrap';
  args?: readonly unknown[];
}

export type ModZoneErrorReporter = (error: unknown, context: ModZoneErrorContext) => void;

/**
 * 受保护执行（guarded）时的错误策略。
 * - onError：自定义错误上报出口，便于观测。
 * - rethrow：是否在上报后继续抛出，启用快速失败。
 * - fallback：当错误被吞掉时返回的兜底值。
 */
export interface ModZoneGuardOptions<T = unknown> {
  onError?: ModZoneErrorReporter;
  rethrow?: boolean;
  fallback?: T | (() => T);
}

/** 外部回调包装器的可选项。 */
export interface ModZoneWrapOptions<TResult = unknown> extends ModZoneGuardOptions<TResult> {
  outer?: boolean;
  guarded?: boolean;
}

/**
 * 对外公开的 mod-zone 门面。
 * 即使运行时没有 Zone，也会提供可用 API（优雅降级为 no-op 模式）。
 */
export interface ModZone {
  readonly name: string;
  readonly enabled: boolean;
  /** runIn 的别名。 */
  run<T>(callback: () => T): T;
  /** 在 mod zone 内执行逻辑。 */
  runIn<T>(callback: () => T): T;
  /** 在创建时捕获的外层 zone 中执行逻辑。 */
  runOuter<T>(callback: () => T): T;
  /** 使用统一错误上报与可选兜底值执行逻辑。 */
  runGuarded<T>(callback: () => T, options?: ModZoneGuardOptions<T>): T | undefined;
  /**
   * 包装外部回调，使其在目标 zone 中运行，并可附加 guarded 策略。
   * 包装后会保持原始的 `this` 与参数语义。
   */
  wrap<TArgs extends any[], TResult>(
    callback: (...args: TArgs) => TResult,
    options?: ModZoneWrapOptions<TResult>
  ): (...args: TArgs) => TResult | undefined;
  /** 在当前 zone 上下文下派生一个子 mod zone。 */
  fork(name: string, options?: Omit<CreateModZoneOptions, 'name'>): ModZone;
}

const DEFAULT_ZONE_NAME = 'mod';
const DEFAULT_PREFIX = 'PortableUiMod';

/** 若 zone.js 已生效则返回当前 zone，否则返回 null。 */
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

/** 调用方未提供上报器时使用的默认错误上报函数。 */
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
  // 统一归一化配置，保证各分支使用一致默认值。
  const normalized = normalizeOptions(options);
  const zoneName = normalized.prefix
    ? `${normalized.prefix}:${normalized.name}`
    : normalized.name;
  const outerZone = getCurrentZone();
  const defaultOnError = normalized.onError ?? defaultErrorReporter;
  const defaultRethrow = normalized.rethrowErrors ?? false;

  // runGuarded 的工厂函数。
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

  // wrap 的工厂函数，主要用于对接外部事件系统回调。
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
        // 保留调用方 this 与参数。
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

  // 优雅降级：当 Zone API 不可用时，维持同一套门面行为。
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

  // 正常模式：为当前 mod 实例 fork 一个专属 inner zone。
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
      // 某些集成场景需要明确在 outer zone 执行。
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

