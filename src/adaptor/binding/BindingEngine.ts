import {effect, isComputed, isSignal} from 'alien-signals';

import {BaseComponent} from '../../core';
import type {
  BindingContext,
  BindingOptions,
  ObjectKeyBinding,
  ObjectKeyPathOf,
  PortableUiBindingHost,
  PortableUiBindingMap,
  PortableUiBindingsMap,
  PortableUiCallback,
  PortableUiCallbackSource,
  PortableUiReadableAccessor,
  PortableUiReadableBindingSource,
  PortableUiWritableAccessor,
  PortableUiWritableBindingField,
  PortableUiWritableSignal,
} from '../types';
import {getValueAtPath, hasPath, matchesDirtyPath, setValueAtPath} from './PathAccess';
import {ObjectBindingIndex} from './ObjectBindingIndex';
import {ZoneScheduler, type ZoneSchedulerHooks} from './ZoneScheduler';

type BindingOwnerType = 'adapter' | 'app';

type ComponentRef = {current: BaseComponent<any> | null};

type ValueBindingRegistration = {
  propName: string;
  source: PortableUiReadableBindingSource<any>;
  componentRef: ComponentRef;
  path?: string;
  requiresMarkDirty: boolean;
};

type PreparedComponentBinding = {
  props: Record<string, any>;
  bindings?: PortableUiBindingMap<Record<string, any>>;
  componentRef: ComponentRef;
  componentId: string;
  componentKey: string;
};

type CallbackRegistration = {
  source: PortableUiCallbackSource;
  preferContext: boolean;
};

type BindingEngineOptions<TModel extends Record<string, any>> = {
  model?: TModel;
  bindings?: PortableUiBindingsMap;
  options?: BindingOptions;
  ownerType: BindingOwnerType;
};

function isCallbackKey(key: string): key is `on${string}` {
  return key.startsWith('on');
}

function isAccessor<T = any>(value: unknown): value is PortableUiReadableAccessor<T> {
  return typeof value === 'object' && value !== null && 'get' in value && typeof (value as {get?: unknown}).get === 'function';
}

function isWritableAccessor<T = any>(value: unknown): value is PortableUiWritableAccessor<T> {
  return isAccessor<T>(value) && typeof (value as {set?: unknown}).set === 'function';
}

function isWritableSignal<T = any>(value: unknown): value is PortableUiWritableSignal<T> {
  return typeof value === 'function' && isSignal(value as () => void);
}

function isReadableSignal(value: unknown): value is () => any {
  return typeof value === 'function' && (isSignal(value as () => void) || isComputed(value as () => void));
}

function isObjectKeyBinding(value: unknown): value is ObjectKeyBinding<any, any> {
  return (
    typeof value === 'object'
    && value !== null
    && 'target' in value
    && 'key' in value
    && typeof (value as any).target === 'object'
    && typeof (value as any).key === 'string'
  );
}

function isWritableBindingField(field: string): field is PortableUiWritableBindingField {
  return field === 'value'
    || field === 'checked'
    || field === 'valuePath'
    || field === 'activeTabId'
    || field === 'selectedId';
}

function getWritebackEvents(field: string): string[] {
  switch (field) {
    case 'value':
      return ['onInput', 'onChange', 'onSelect'];
    case 'checked':
    case 'valuePath':
      return ['onChange'];
    case 'activeTabId':
      return ['onTabChange'];
    case 'selectedId':
      return ['onSelect'];
    default:
      return [];
  }
}

function mergeBindings(
  localBindings: PortableUiBindingMap<Record<string, any>> | undefined,
  globalBindings: PortableUiBindingMap<Record<string, any>> | undefined,
  warn: (code: string, detail?: Record<string, any>) => void,
  componentId: string,
  componentKey: string
): PortableUiBindingMap<Record<string, any>> | undefined {
  if (!localBindings && !globalBindings) {
    return undefined;
  }

  const merged: PortableUiBindingMap<Record<string, any>> = {...(localBindings ?? {})};
  for (const [field, value] of Object.entries(globalBindings ?? {})) {
    if (field in merged) {
      warn('BINDING_CONFLICT', {
        componentId,
        componentKey,
        field,
        from: 'node.bind',
        to: 'bindings',
      });
    }
    (merged as Record<string, unknown>)[field] = value;
  }

  return merged;
}

function createProxyModel<TModel extends Record<string, any>>(
  model: TModel,
  notify: (path: string) => void
): TModel {
  const cache = new WeakMap<object, any>();

  const wrap = (target: any, path: string): any => {
    if (target == null || typeof target !== 'object') {
      return target;
    }

    if (cache.has(target)) {
      return cache.get(target);
    }

    const proxy = new Proxy(target, {
      get(currentTarget, property, receiver) {
        const value = Reflect.get(currentTarget, property, receiver);
        if (typeof property !== 'string') {
          return value;
        }

        const nextPath = path ? `${path}.${property}` : property;
        return wrap(value, nextPath);
      },
      set(currentTarget, property, value, receiver) {
        const success = Reflect.set(currentTarget, property, value, receiver);
        if (success && typeof property === 'string') {
          notify(path ? `${path}.${property}` : property);
        }
        return success;
      },
      deleteProperty(currentTarget, property) {
        const success = Reflect.deleteProperty(currentTarget, property);
        if (success && typeof property === 'string') {
          notify(path ? `${path}.${property}` : property);
        }
        return success;
      },
    });

    cache.set(target, proxy);
    return proxy;
  };

  return wrap(model, '') as TModel;
}

export class BindingEngine<TModel extends Record<string, any> = Record<string, any>> {
  readonly boundModel: TModel;

  private owner: PortableUiBindingHost<TModel> | null = null;
  private readonly model: TModel;
  private readonly globalBindings: PortableUiBindingsMap;
  private readonly scheduler: ZoneScheduler;
  private readonly warnEnabled: boolean;
  private readonly strict: boolean;
  private readonly proxyEnabled: boolean;
  private readonly ownerType: BindingOwnerType;
  private readonly registrations = new Map<string, ValueBindingRegistration[]>();
  private readonly disposers = new Map<string, Array<() => void>>();
  private readonly pendingUpdates = new Map<string, () => void>();
  private readonly emittedWarnings = new Set<string>();
  // 新增：对象级绑定索引
  private readonly objectBindingIndex = new ObjectBindingIndex();
  // 新增：zone 内收集的脏对象与路径（用对象存储以避免类型问题）
  private readonly pendingDirtyObjects: Array<{target: object; key?: string | undefined}> = [];
  // 新增：标志是否在 flushing，防止重入
  private isFlushing = false;

  constructor({model, bindings, options, ownerType}: BindingEngineOptions<TModel>) {
    this.model = (model ?? {}) as TModel;
    this.globalBindings = bindings ?? {};
    // 新增：传入 zone hooks
    const hooks: ZoneSchedulerHooks = {
      onTaskDone: () => this.onZoneTaskDone(),
      onMicrotaskEmpty: () => this.onZoneMicrotaskEmpty(),
    };
    this.scheduler = new ZoneScheduler(options?.flush ?? 'microtask', options?.zoneAutoDirty ? hooks : undefined);
    this.warnEnabled = options?.warn ?? true;
    this.strict = options?.strict ?? false;
    this.proxyEnabled = options?.proxy ?? false;
    this.ownerType = ownerType;
    this.boundModel = this.proxyEnabled
      ? createProxyModel(this.model, (path) => this.markDirty(path))
      : this.model;
  }

  // ...existing code...

  private onZoneTaskDone(): void {
    if (!this.pendingDirtyObjects.length) {
      return;
    }
    this.flushCollectedDirty();
  }

  private onZoneMicrotaskEmpty(): void {
    if (!this.pendingDirtyObjects.length) {
      return;
    }
    this.flushCollectedDirty();
  }

  private flushCollectedDirty(): void {
    if (this.isFlushing) {
      return;
    }

    this.isFlushing = true;
    try {
      const collected = Array.from(this.pendingDirtyObjects);
      this.pendingDirtyObjects.length = 0;

      for (const {target, key} of collected) {
        const regs = this.objectBindingIndex.collectByTargetAndKey(target, key);
        for (const reg of regs) {
          if (reg.updateFn) {
            reg.updateFn();
          }
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  // 新增：zone 内触发的脏标记（收集而非立即刷新）
  private touchDirty(target: object, key: string | undefined = undefined): void {
    this.pendingDirtyObjects.push({target, key: key ?? undefined});
  }

  // 新增：对象级 markDirty，触发脏集合 flush
  markDirtyObject(target: object, key?: string): void {
    const regs = this.objectBindingIndex.collectByTargetAndKey(target, key);
    for (const reg of regs) {
      if (reg.updateFn) {
        this.scheduler.run(() => {
          reg.updateFn?.();
        });
      }
    }
  }

  markDirtyAll(target: object): void {
    this.markDirtyObject(target);
  }

  setOwner(owner: PortableUiBindingHost<TModel> | any): void {
    this.owner = owner;
  }

  getModel(): TModel {
    return this.boundModel;
  }

  prepareComponentBindings(
    componentKey: string,
    componentId: string,
    rawProps: Record<string, any>
  ): PreparedComponentBinding {
    const componentRef: ComponentRef = {current: null};
    const localBindings = rawProps.bind as PortableUiBindingMap<Record<string, any>> | undefined;
    const globalBindings = this.resolveGlobalBindings(componentKey, componentId);
    const bindings = mergeBindings(localBindings, globalBindings, this.warn, componentId, componentKey);
    const originalProps = {...rawProps};
    delete originalProps.bind;

     const preparedProps: Record<string, any> = {...originalProps};
    if (bindings) {
      for (const [field, source] of Object.entries(bindings)) {
        if (isCallbackKey(field)) {
          continue;
        }

        // 新增：ObjectKeyBinding 的初始化：读取初始值放入 preparedProps，动态订阅放在 attachComponent 中
        if (isObjectKeyBinding(source)) {
          preparedProps[field] = getValueAtPath(source.target, source.key);
          continue;
        }

        preparedProps[field] = this.readBindingValue(source as PortableUiReadableBindingSource<any>, componentId, field);
      }
    }

    const eventHandlers = new Map<string, {callbacks: CallbackRegistration[]; writebacks: Array<{field: string; source: PortableUiReadableBindingSource<any>}>}>();

    for (const [field, value] of Object.entries(originalProps)) {
      if (!isCallbackKey(field) || typeof value !== 'function') {
        continue;
      }

      const entry = eventHandlers.get(field) ?? {callbacks: [], writebacks: []};
      entry.callbacks.push({source: value as PortableUiCallback, preferContext: false});
      eventHandlers.set(field, entry);
    }

    for (const [field, source] of Object.entries(bindings ?? {})) {
      if (isCallbackKey(field)) {
        const entry = eventHandlers.get(field) ?? {callbacks: [], writebacks: []};
        entry.callbacks.push({source: source as PortableUiCallbackSource, preferContext: true});
        eventHandlers.set(field, entry);
        continue;
      }

      // 新增：支持 ObjectKeyBinding 的写回
      if (isObjectKeyBinding(source)) {
        if (source.mode !== 'ro') { // 非只读
          for (const eventName of getWritebackEvents(field)) {
            const entry = eventHandlers.get(eventName) ?? {callbacks: [], writebacks: []};
            entry.writebacks.push({field, source: source as any});
            eventHandlers.set(eventName, entry);
          }
        }
        continue;
      }

      if (!isWritableBindingField(field)) {
        continue;
      }

      for (const eventName of getWritebackEvents(field)) {
        const entry = eventHandlers.get(eventName) ?? {callbacks: [], writebacks: []};
        entry.writebacks.push({field, source: source as PortableUiReadableBindingSource<any>});
        eventHandlers.set(eventName, entry);
      }
    }

    for (const [eventName, entry] of eventHandlers.entries()) {
      preparedProps[eventName] = (...args: any[]) => {
        return this.scheduler.run(() => {
          const component = componentRef.current;
          if (!component) {
            return undefined;
          }

          const ctx = this.createContext(component, componentId);

          for (const writeback of entry.writebacks) {
            const nextValue = this.extractWritebackValue(writeback.field, args);
            if (nextValue !== undefined) {
              this.writeBindingValue(writeback.source, nextValue, componentId, writeback.field);
            }
          }

          let lastResult: unknown;
          for (const callbackRegistration of entry.callbacks) {
            const callback = this.resolveCallback(callbackRegistration.source, componentId, eventName);
            if (!callback) {
              continue;
            }
            lastResult = this.invokeCallback(callback, ctx, args, callbackRegistration.preferContext);
          }

          return lastResult;
        });
      };
    }

    return {
      props: preparedProps,
      componentRef,
      componentId,
      componentKey,
      ...(bindings ? {bindings} : {}),
    };
  }

  attachComponent(prepared: PreparedComponentBinding, component: BaseComponent<any>): void {
    prepared.componentRef.current = component;

    if (!prepared.bindings) {
      // 新增：即使没有绑定也要在索引中注册组件以便清理
      return;
    }

    const registrations: ValueBindingRegistration[] = [];
    const disposers: Array<() => void> = [];

    for (const [field, source] of Object.entries(prepared.bindings)) {
      if (isCallbackKey(field)) {
        continue;
      }

      // 新增：处理 ObjectKeyBinding
      if (isObjectKeyBinding(source)) {
        const targetId = this.objectBindingIndex.getTargetId(source.target);
        const updateFn = () => {
          const component = prepared.componentRef.current;
          if (!component || !component.isMounted()) {
            return;
          }

          const nextValue = getValueAtPath(source.target, source.key);
          const equals = source.equals ?? ((a: any, b: any) => a === b);
          const prevValue = component.getProps()[field];

          if (!equals(prevValue, nextValue)) {
            component.update({[field]: nextValue});
          }
        };

        const objReg = {
          componentId: prepared.componentId,
          propName: field,
          targetId,
          key: source.key,
          ...(source.changeDetection ? {changeDetection: source.changeDetection} : {}),
          componentRef: prepared.componentRef,
          updateFn,
        };

        this.objectBindingIndex.add(objReg);

        // 初始值已在 prepareComponentBindings 中设置到 prepared.props，此处无需重复设置

        continue;
      }

      const registration: ValueBindingRegistration = {
        propName: field,
        source: source as PortableUiReadableBindingSource<any>,
        componentRef: prepared.componentRef,
        requiresMarkDirty: typeof source === 'string' || (isAccessor(source) && typeof source.subscribe !== 'function'),
        ...(typeof source === 'string' ? {path: source} : {}),
      };
      registrations.push(registration);

      if (isReadableSignal(source)) {
        let initialRun = true;
        const dispose = effect(() => {
          source();
          if (initialRun) {
            initialRun = false;
            return;
          }
          this.queueComponentRefresh(prepared.componentId, registration);
        });
        disposers.push(dispose);
        continue;
      }

      if (isAccessor(source) && typeof source.subscribe === 'function') {
        const dispose = source.subscribe(() => {
          this.queueComponentRefresh(prepared.componentId, registration);
        });
        disposers.push(dispose);
      }
    }

    if (registrations.length > 0) {
      this.registrations.set(prepared.componentId, registrations);
    }

    if (disposers.length > 0) {
      this.disposers.set(prepared.componentId, disposers);
    }
  }

  detachComponent(componentId: string): void {
    this.registrations.delete(componentId);

    // 新增：从对象索引中清理
    this.objectBindingIndex.removeByComponent(componentId);

    const disposers = this.disposers.get(componentId);
    for (const dispose of disposers ?? []) {
      try {
        dispose();
      } catch {
        // Ignore cleanup failures from external subscriptions.
      }
    }

    this.disposers.delete(componentId);

    for (const key of Array.from(this.pendingUpdates.keys())) {
      if (key.startsWith(`${componentId}:`)) {
        this.pendingUpdates.delete(key);
      }
    }
  }

  markDirty(path?: string): void {
    for (const [componentId, registrations] of this.registrations.entries()) {
      for (const registration of registrations) {
        if (!registration.requiresMarkDirty) {
          continue;
        }

        if (registration.path) {
          if (!matchesDirtyPath(registration.path, path)) {
            continue;
          }
        } else if (path) {
          continue;
        }

        this.queueComponentRefresh(componentId, registration);
      }
    }
  }

  destroy(): void {
    for (const componentId of Array.from(this.registrations.keys())) {
      this.detachComponent(componentId);
    }

    // 新增：清理对象索引
    this.objectBindingIndex.clear();

    this.pendingUpdates.clear();
    this.pendingDirtyObjects.length = 0;
    this.scheduler.destroy();
  }

  private resolveGlobalBindings(componentKey: string, componentId: string): PortableUiBindingMap<Record<string, any>> | undefined {
    const byKey = this.globalBindings[componentKey];
    const byId = componentId !== componentKey ? this.globalBindings[componentId] : undefined;

    if (!byKey && !byId) {
      return undefined;
    }

    if (!byKey) {
      return byId;
    }

    if (!byId) {
      return byKey;
    }

    return mergeBindings(byKey, byId, this.warn, componentId, componentKey);
  }

  private queueComponentRefresh(componentId: string, registration: ValueBindingRegistration): void {
    const updateKey = `${componentId}:${registration.propName}`;
    this.pendingUpdates.set(updateKey, () => {
      const component = registration.componentRef.current;
      if (!component || !component.isMounted()) {
        return;
      }

      const nextValue = this.readBindingValue(registration.source, componentId, registration.propName);
      component.update({[registration.propName]: nextValue});
    });

    this.scheduler.schedule(() => {
      const updates = Array.from(this.pendingUpdates.values());
      this.pendingUpdates.clear();
      for (const update of updates) {
        update();
      }
    });
  }

  private readBindingValue(source: PortableUiReadableBindingSource<any>, componentId: string, field: string): any {
    if (typeof source === 'string') {
      if (this.strict && !hasPath(this.boundModel, source)) {
        this.warn('MISSING_BINDING_PATH', {componentId, field, path: source});
      }
      return getValueAtPath(this.boundModel, source);
    }

    if (isReadableSignal(source)) {
      return source();
    }

    if (isAccessor(source)) {
      return source.get();
    }

    this.warn('INVALID_BINDING_SOURCE', {componentId, field});
    return undefined;
  }

  private writeBindingValue(
    source: PortableUiReadableBindingSource<any> | ObjectKeyBinding<any, any>,
    value: any,
    componentId: string,
    field: string
  ): void {
    // 新增：处理 ObjectKeyBinding 的写回
    if (isObjectKeyBinding(source)) {
      setValueAtPath(source.target, source.key, value);
      if (source.detect === 'manual') {
        this.markDirtyObject(source.target, source.key);
      }
      return;
    }

    if (typeof source === 'string') {
      setValueAtPath(this.boundModel, source, value);
      if (!this.proxyEnabled) {
        this.markDirty(source);
      }
      return;
    }

    if (isWritableSignal(source)) {
      (source as PortableUiWritableSignal<any>)(value);
      return;
    }

    if (isWritableAccessor(source)) {
      source.set(value);
      if (typeof source.subscribe !== 'function') {
        this.markDirty();
      }
      return;
    }

    this.warn('READONLY_BINDING_WRITE', {componentId, field});
  }

  private createContext(component: BaseComponent<any>, componentId: string): BindingContext<TModel> {
    // 新增：为上下文保存一个 touch 引用，用于在 zone 内标记脏对象
    let touchTarget: object | null = null;
    let touchKey: string | undefined;

    return {
      model: this.boundModel,
      component,
      markDirty: (path?: string) => this.markDirty(path),
      get: (path: string) => getValueAtPath(this.boundModel, path),
      set: (path: string, value: any) => {
        setValueAtPath(this.boundModel, path, value);
        if (!this.proxyEnabled) {
          this.markDirty(path);
        }
      },
      warn: (code: string, detail?: Record<string, any>) => this.warn(code, {componentId, ...detail}),
      // 新增：touch 方法，支持在 zone hooks 内的脏收集
      touch: (key?: string) => {
        if (touchTarget) {
          this.touchDirty(touchTarget, key);
        }
      },
      ...(this.ownerType === 'adapter' && this.owner ? {adapter: this.owner} : {}),
      ...(this.ownerType === 'app' && this.owner ? {app: this.owner} : {}),
    };
  }

  private resolveCallback(source: PortableUiCallbackSource, componentId: string, eventName: string): PortableUiCallback | null {
    if (typeof source === 'function') {
      return source;
    }

    const resolved = getValueAtPath(this.boundModel, source);
    if (typeof resolved !== 'function') {
      this.warn('INVALID_CALLBACK_BINDING', {componentId, eventName, path: source});
      return null;
    }

    return resolved as PortableUiCallback;
  }

  private invokeCallback(
    callback: PortableUiCallback,
    ctx: BindingContext<TModel>,
    args: any[],
    preferContext: boolean
  ): unknown {
    const shouldUseContext = preferContext
      ? callback.length !== args.length || callback.length === 1
      : callback.length > args.length;

    if (shouldUseContext) {
      return callback(ctx, ...args);
    }

    return callback(...args);
  }

  private extractWritebackValue(field: string, args: any[]): any {
    const event = args[1] as Event | undefined;
    const payload = args.length > 2 ? args[2] : undefined;

    if (field === 'checked') {
      if (typeof payload === 'boolean') {
        return payload;
      }
      const target = event?.target as HTMLInputElement | null;
      return target?.checked;
    }

    if (field === 'valuePath') {
      return payload;
    }

    if (field === 'activeTabId' || field === 'selectedId') {
      if (payload && typeof payload === 'object' && 'id' in payload) {
        return (payload as {id: string}).id;
      }
      return payload;
    }

    if (payload && typeof payload === 'object' && 'value' in payload) {
      return (payload as {value: any}).value;
    }

    if (payload !== undefined) {
      return payload;
    }

    const target = event?.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    return target?.value;
  }

  private warn = (code: string, detail?: Record<string, any>): void => {
    if (!this.warnEnabled) {
      return;
    }

    const key = `${code}:${JSON.stringify(detail ?? {})}`;
    if (this.emittedWarnings.has(key)) {
      return;
    }
    this.emittedWarnings.add(key);

    console.warn(`[PortableUi Binding Warn][${code}]`, detail ?? {});
  };
}

export type {PreparedComponentBinding};



