import {createModZone} from '../../src';

function currentZoneName(): string | undefined {
  return (globalThis as typeof globalThis & {Zone?: {current?: {name?: string}}}).Zone?.current?.name;
}

describe('ModZone helper', () => {
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
});


