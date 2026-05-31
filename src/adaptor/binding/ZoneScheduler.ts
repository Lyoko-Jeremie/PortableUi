import 'zone.js';

import type {BindingFlushMode} from '../types';

function resolveZone(): {run<T>(callback: () => T): T} | null {
  const zoneCtor = (globalThis as typeof globalThis & {Zone?: {current?: {fork: (spec: {name: string}) => {run<T>(callback: () => T): T}}}}).Zone;
  if (!zoneCtor?.current?.fork) {
    return null;
  }

  return zoneCtor.current.fork({name: 'PortableUiBindingZone'});
}

export class ZoneScheduler {
  private readonly zone = resolveZone();
  private scheduled = false;
  private destroyed = false;

  constructor(private readonly mode: BindingFlushMode = 'microtask') {
  }

  run<T>(callback: () => T): T {
    if (this.zone) {
      return this.zone.run(callback);
    }

    return callback();
  }

  schedule(callback: () => void): void {
    if (this.destroyed) {
      return;
    }

    if (this.mode === 'sync') {
      this.run(callback);
      return;
    }

    if (this.scheduled) {
      return;
    }

    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      if (this.destroyed) {
        return;
      }

      this.run(callback);
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.scheduled = false;
  }
}

