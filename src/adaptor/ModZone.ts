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
}

export interface ModZone {
  readonly name: string;
  readonly enabled: boolean;
  run<T>(callback: () => T): T;
  runIn<T>(callback: () => T): T;
  runOuter<T>(callback: () => T): T;
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

function normalizeOptions(options: string | CreateModZoneOptions | undefined): Required<CreateModZoneOptions> {
  if (typeof options === 'string') {
    return {
      name: options,
      prefix: DEFAULT_PREFIX,
      properties: {},
    };
  }

  return {
    name: options?.name?.trim() || DEFAULT_ZONE_NAME,
    prefix: options?.prefix?.trim() || DEFAULT_PREFIX,
    properties: options?.properties ?? {},
  };
}

export function createModZone(options?: string | CreateModZoneOptions): ModZone {
  const normalized = normalizeOptions(options);
  const zoneName = normalized.prefix
    ? `${normalized.prefix}:${normalized.name}`
    : normalized.name;
  const outerZone = getCurrentZone();

  if (!outerZone?.fork) {
    return {
      name: zoneName,
      enabled: false,
      run: runDirect,
      runIn: runDirect,
      runOuter: runDirect,
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

  return {
    name: zoneName,
    enabled: true,
    run: runIn,
    runIn,
    runOuter,
    fork(name, nextOptions) {
      return runIn(() => createModZone({
        ...nextOptions,
        name,
        prefix: nextOptions?.prefix ?? zoneName,
      }));
    },
  };
}

