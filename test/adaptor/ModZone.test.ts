import {createModZone} from '../../src';

function currentZoneName(): string | undefined {
  return (globalThis as typeof globalThis & {Zone?: {current?: {name?: string}}}).Zone?.current?.name;
}

describe('ModZone helper', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('runs code inside the mod zone and allows running in outer zone', () => {
    const modZone = createModZone({name: 'test-main', prefix: 'PortableUiTest'});

    let inName: string | undefined;
    let outName: string | undefined;

    modZone.runIn(() => {
      inName = currentZoneName();
      outName = modZone.runOuter(() => currentZoneName());
    });

    expect(inName).toBe(modZone.name);
    if (modZone.enabled) {
      expect(outName).not.toBe(modZone.name);
    }
  });

  it('supports run alias and returns callback value', () => {
    const modZone = createModZone('test-run');
    const value = modZone.run(() => 123);
    expect(value).toBe(123);
  });

  it('can fork child mod zones and return to parent with runOuter', () => {
    const parent = createModZone({name: 'parent', prefix: 'PortableUiTest'});
    const child = parent.fork('child');

    let parentName: string | undefined;
    let childName: string | undefined;
    let childOuterName: string | undefined;

    parent.runIn(() => {
      parentName = currentZoneName();
      child.runIn(() => {
        childName = currentZoneName();
        childOuterName = child.runOuter(() => currentZoneName());
      });
    });

    expect(parentName).toBe(parent.name);
    expect(childName).toBe(child.name);
    if (parent.enabled && child.enabled) {
      expect(childOuterName).toBe(parent.name);
    }
  });

  it('reports errors through runGuarded and returns fallback', () => {
    const reporter = jest.fn();
    const modZone = createModZone({name: 'guarded', prefix: 'PortableUiTest', onError: reporter});

    const value = modZone.runGuarded(
      () => {
        throw new Error('guarded failure');
      },
      {fallback: 'safe-value'}
    );

    expect(value).toBe('safe-value');
    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter.mock.calls[0][1]).toMatchObject({
      zoneName: modZone.name,
      phase: 'runGuarded',
    });
  });

  it('wraps external callbacks into runIn and keeps this/args', () => {
    const modZone = createModZone({name: 'wrap-in', prefix: 'PortableUiTest'});
    const host = {
      value: 0,
      add(delta: number): number {
        this.value += delta;
        return this.value;
      },
    };

    let callbackZoneName: string | undefined;
    const wrapped = modZone.wrap(function (this: typeof host, delta: number): number {
      callbackZoneName = currentZoneName();
      return this.add(delta);
    });

    const result = wrapped.call(host, 5);

    expect(result).toBe(5);
    expect(host.value).toBe(5);
    expect(callbackZoneName).toBe(modZone.name);
  });

  it('wrap supports guarded error reporting and fallback', () => {
    const reporter = jest.fn();
    const modZone = createModZone({name: 'wrap-guard', prefix: 'PortableUiTest', onError: reporter});
    const wrapped = modZone.wrap(
      () => {
        throw new Error('wrap failure');
      },
      {fallback: 42}
    );

    const result = wrapped();

    expect(result).toBe(42);
    expect(reporter).toHaveBeenCalledTimes(1);
    expect(reporter.mock.calls[0][1]).toMatchObject({
      zoneName: modZone.name,
      phase: 'wrap',
    });
  });
});


