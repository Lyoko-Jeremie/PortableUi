import 'zone.js';

import type {BindingFlushMode} from '../types';

export interface ZoneSchedulerHooks {
  onTaskDone?: () => void;
  onMicrotaskEmpty?: () => void;
}

function resolveZone(hooks: ZoneSchedulerHooks): {run<T>(callback: () => T): T} | null {
  const zoneCtor = (globalThis as typeof globalThis & {Zone?: {current?: {fork: (spec: any) => {run<T>(callback: () => T): T}}}}).Zone;
  if (!zoneCtor?.current?.fork) {
    return null;
  }

  return zoneCtor.current.fork({
    name: 'PortableUiBindingZone',
    onInvokeTask(delegate: any, current: any, target: any, task: any, applyThis: any, applyArgs: any[]) {
      try {
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      } finally {
        hooks.onTaskDone?.();
      }
    },
    onHasTask(delegate: any, current: any, target: any, hasTaskState: any) {
      delegate.hasTask(target, hasTaskState);
      if (!hasTaskState.microTask && !hasTaskState.macroTask) {
        hooks.onMicrotaskEmpty?.();
      }
    },
  });
}

export class ZoneScheduler {
  private readonly zone: {run<T>(callback: () => T): T} | null;
  private scheduled = false;
  private destroyed = false;

  constructor(
    private readonly mode: BindingFlushMode = 'microtask',
    hooks?: ZoneSchedulerHooks,
  ) {
    this.zone = resolveZone(hooks ?? {});
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

