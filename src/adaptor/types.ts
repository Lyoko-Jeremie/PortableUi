import {BaseComponent} from '../core';

export type ComponentCtor<
  TProps extends Record<string, any> = Record<string, any>,
  TInstance extends BaseComponent<any> = BaseComponent<any>,
> = new (props?: TProps) => TInstance;

export type DeclarativeRegistry = Record<string, ComponentCtor>;

type KnownKeys<T> = {
  [K in keyof T]: string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K;
}[keyof T];

type KnownProps<T> = {
  [K in KnownKeys<T>]: T[K];
};

export type PortableUiStrictProps<T> = KnownProps<T>;

type IsAny<T> = 0 extends (1 & T) ? true : false;

type HasStringIndex<T> = string extends keyof T ? true : false;

type IsPlainObject<T> = T extends object
  ? T extends (...args: any[]) => any
    ? false
    : T extends readonly any[]
      ? false
      : true
  : false;

type InternalModelPath<T> = {
  [K in Extract<KnownKeys<T>, string>]: IsPlainObject<T[K]> extends true
    ? K | `${K}.${InternalModelPath<T[K]>}`
    : K;
}[Extract<KnownKeys<T>, string>];

export type PortableUiModelPath<TModel extends Record<string, any>> = IsAny<TModel> extends true
  ? string
  : HasStringIndex<TModel> extends true
    ? string
    : InternalModelPath<TModel>;

export type PortableUiPathValue<TObject, TPath extends string> = TPath extends `${infer THead}.${infer TTail}`
  ? THead extends keyof TObject
    ? PortableUiPathValue<TObject[THead], TTail>
    : never
  : TPath extends keyof TObject
    ? TObject[TPath]
    : never;

export type PortableUiFunctionPath<TModel extends Record<string, any>> = PortableUiModelPath<TModel> extends infer TPath
  ? TPath extends string
    ? PortableUiPathValue<TModel, TPath> extends (...args: any[]) => any
      ? TPath
      : never
    : never
  : never;

export type PathBinding<TModel extends Record<string, any> = Record<string, any>> = PortableUiModelPath<TModel>;

export type PortableUiReadableSignal<T = any> = () => T;

export interface PortableUiWritableSignal<T = any> {
  (): T;

  (value: T): void;
}

export interface PortableUiReadableAccessor<T = any> {
  get: () => T;
  subscribe?: (notify: () => void) => () => void;
}

export interface PortableUiWritableAccessor<T = any> extends PortableUiReadableAccessor<T> {
  set: (value: T) => void;
}

export type PortableUiReadableBindingSource<T = any, TModel extends Record<string, any> = Record<string, any>> =
  | PathBinding<TModel>
  | PortableUiReadableSignal<T>
  | PortableUiReadableAccessor<T>;

export type PortableUiWritableBindingSource<T = any, TModel extends Record<string, any> = Record<string, any>> =
  | PathBinding<TModel>
  | PortableUiWritableSignal<T>
  | PortableUiWritableAccessor<T>;

export type PortableUiCallback = (...args: any[]) => unknown;

export type PortableUiCallbackSource<TModel extends Record<string, any> = Record<string, any>> =
  | PortableUiFunctionPath<TModel>
  | PortableUiCallback;

export type PortableUiWritableBindingField = 'value' | 'checked' | 'valuePath' | 'activeTabId' | 'selectedId';

// 新增：Object Key 路径推导（支持点分隔 deep path 的 IDE 提示）
type ObjectKeyPathInner<T, Prefix extends string = ''> = {
  [K in Extract<KnownKeys<T>, string>]:
    | `${Prefix}${K}`
    | (IsPlainObject<T[K]> extends true
        ? ObjectKeyPathInner<T[K], `${Prefix}${K}.`>
        : never);
}[Extract<KnownKeys<T>, string>];

export type ObjectKeyPathOf<T extends Record<string, any>> = IsAny<T> extends true
  ? string
  : HasStringIndex<T> extends true
    ? string
    : ObjectKeyPathInner<T>;

// 新增：组件级变更检测模式
/**
 * 变更检测模式（与 Zone.js 联动）：
 *
 * - 'binding': 基于绑定的变更检测，仅路径/对象脏标记驱动（性能优先）
 *   @example
 *   // 与 createModZone + zoneAutoDirty 配合：需要显式 markDirty 或 ctx.touch()
 *   const modZone = createModZone({ name: 'my-mod' });
 *   const ui = modZone.runIn(() => CreatePortableUi(host, {
 *     bindingOptions: { changeDetection: 'binding', zoneAutoDirty: true },
 *     children: {
 *       field: {
 *         type: 'Input',
 *         bind: { value: { target: data, key: 'name' } }
 *       }
 *     }
 *   }));
 *   // 更新数据时，必须调用：
 *   modZone.runIn(() => {
 *     data.name = 'new value';
 *     ctx.touch('name'); // 或 ui.markDirty(data, 'name')
 *   });
 *
 * - 'tree': 基于组件树的变更检测，Zone 稳定后自动参与树级扫描
 *   @example
 *   // 与 createModZone + zoneAutoDirty 配合：自动扫描整个组件树
 *   const ui = modZone.runIn(() => CreatePortableUi(host, {
 *     bindingOptions: { changeDetection: 'tree', zoneAutoDirty: true },
 *     children: { /* ... */ }
 *   }));
 *   // 更新数据，不需要 markDirty，zone 稳定后自动扫描检测
 *   modZone.runIn(() => {
 *     data.field1 = 'changed';
 *     data.field2 = 'changed';
 *     // zone 任务结束时自动触发树扫描
 *   });
 *
 * - 'hybrid': 混合模式，先尝试 binding 检测，失败时参与 tree 兜底
 *   @example
 *   // 与 createModZone + zoneAutoDirty 配合：灵活组合两种策略
 *   const ui = modZone.runIn(() => CreatePortableUi(host, {
 *     bindingOptions: { changeDetection: 'hybrid', zoneAutoDirty: true },
 *     children: {
 *       // 直接绑定的字段：由 binding 驱动
 *       nameInput: {
 *         type: 'Input',
 *         bind: { value: { target: user, key: 'profile.name' } }
 *       },
 *       // 非绑定的字段变化：降级由 tree 扫描驱动
 *     }
 *   }));
 *   modZone.runIn(() => {
 *     user.profile.name = 'Alice'; // binding 命中
 *     user.profile.age = 30;       // tree 扫描兜底
 *   });
 */
export type ComponentChangeDetectionMode = 'binding' | 'tree' | 'hybrid';

// 新增：ObjectKeyBinding - 对象 + 点分隔 key 绑定（泛型版本，带路径约束）
export interface ObjectKeyBinding<
  TTarget extends Record<string, any> = Record<string, any>,
  TValue = any,
  TKey extends string = ObjectKeyPathOf<TTarget>,
> {
  // 绑定对象根
  target: TTarget;

  // deep 路径，例：profile.name / settings.theme.mode
  key: TKey;

  // rw: 可读可写, ro: 只读展示, wo: 仅写回
  mode?: 'rw' | 'ro' | 'wo';

  // manual: 外部 markDirty, proxy: 写入自动触发
  detect?: 'manual' | 'proxy';

  // 避免重复 update
  equals?: (prev: TValue, next: TValue) => boolean;

  // 组件级覆盖
  changeDetection?: ComponentChangeDetectionMode;
}

type PortableUiBindingValue<TModel extends Record<string, any>> =
  | PortableUiReadableBindingSource<any, TModel>
  | PortableUiWritableBindingSource<any, TModel>
  | PortableUiCallbackSource<TModel>
  | ObjectKeyBinding<any, any>;

export type PortableUiBindingMap<
  TProps extends Record<string, any> = Record<string, any>,
  TModel extends Record<string, any> = Record<string, any>,
> = {
  [K in PortableUiWritableBindingField]?: PortableUiWritableBindingSource<any, TModel> | ObjectKeyBinding<any, any>;
} & {
  [K in `on${string}`]?: PortableUiCallbackSource<TModel>;
} & {
  [K: string]: PortableUiBindingValue<TModel> | undefined;
};

export interface BindableComponentProps<
  TProps extends Record<string, any> = Record<string, any>,
  TModel extends Record<string, any> = Record<string, any>,
> {
  bind?: PortableUiBindingMap<TProps, TModel>;
}

export type PortableUiBindingsMap<TModel extends Record<string, any> = Record<string, any>> =
  Record<string, PortableUiBindingMap<Record<string, any>, TModel>>;

export type BindingFlushMode = 'microtask' | 'sync';

export interface BindingOptions {
  flush?: BindingFlushMode;
  proxy?: boolean;
  warn?: boolean;
  strict?: boolean;
  // 新增：是否启用 zone 自动脏检测
  zoneAutoDirty?: boolean;
  // 全局默认 changeDetection
  changeDetection?: ComponentChangeDetectionMode;
}

export interface PortableUiBindingHost<TModel extends Record<string, any> = Record<string, any>> {
  boundModel: TModel;
  getModel<TResolvedModel extends TModel = TModel>(): TResolvedModel;
  markDirty(path?: PortableUiModelPath<TModel>): void;
  // 新增：对象级脏标记（可选）
  markDirtyObject?(target: object, key?: string): void;
  markDirtyAll?(target: object): void;
}

export interface BindingContext<TModel extends Record<string, any> = Record<string, any>> {
  model: TModel;
  component: BaseComponent<any>;
  adapter?: PortableUiBindingHost<TModel>;
  app?: PortableUiBindingHost<TModel>;
  markDirty: (path?: PortableUiModelPath<TModel>) => void;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  warn: (code: string, detail?: Record<string, any>) => void;
  // 新增：在 zone 内标记本对象的路径脏，等待 zone 稳定后自动 flush
  touch: (key?: string) => void;
}

type ConstructorProps<TCtor extends ComponentCtor> = ConstructorParameters<TCtor>[0] extends undefined
  ? Record<string, never>
  : NonNullable<ConstructorParameters<TCtor>[0]>;

type DeclarativeProps<
  TRegistry extends DeclarativeRegistry,
  TType extends Extract<keyof TRegistry, string>,
  TModel extends Record<string, any>,
> = TType extends 'Button'
  ? ConstructorProps<TRegistry[TType]> & {label?: string}
  : ConstructorProps<TRegistry[TType]>;

export type DeclarativeComponentNode<
  TRegistry extends DeclarativeRegistry,
  TModel extends Record<string, any> = Record<string, any>,
  TType extends Extract<keyof TRegistry, string> = Extract<keyof TRegistry, string>,
> = {
  type: TType;
  props?: DeclarativeProps<TRegistry, TType, TModel>;
  bind?: PortableUiBindingMap<ConstructorProps<TRegistry[TType]>, TModel>;
  children?: DeclarativeChildren<TRegistry, TModel>;
};

export type DeclarativeNodeUnion<
  TRegistry extends DeclarativeRegistry,
  TModel extends Record<string, any> = Record<string, any>,
> = {
  [TType in Extract<keyof TRegistry, string>]: DeclarativeComponentNode<TRegistry, TModel, TType>;
}[Extract<keyof TRegistry, string>];

export type DeclarativeChildren<
  TRegistry extends DeclarativeRegistry,
  TModel extends Record<string, any> = Record<string, any>,
> =
  | Record<string, DeclarativeNodeUnion<TRegistry, TModel>>
  | DeclarativeNodeUnion<TRegistry, TModel>[];

export type StyleIsolationMode = 'none' | 'scoped' | 'shadow';

export interface StyleIsolationConfig {
  mode?: StyleIsolationMode;
  styles?: string;
}

export interface PortableUiDeclarativeConfig<
  TRegistry extends DeclarativeRegistry,
  TModel extends Record<string, any> = Record<string, any>,
> {
  id?: string;
  children: DeclarativeChildren<TRegistry, TModel>;
  styleIsolation?: StyleIsolationConfig;
  model?: TModel;
  bindings?: PortableUiBindingsMap<TModel>;
  bindingOptions?: BindingOptions;
}

type ResolveId<TId, TFallback extends string> = TId extends string
  ? string extends TId
    ? TFallback
    : TId
  : TFallback;

type NodeId<
  TNode,
  TFallback extends string,
> = TNode extends {props?: infer TProps}
  ? ResolveId<TProps extends {id?: infer TId} ? TId : never, TFallback>
  : TFallback;

type NodeInstance<
  TRegistry extends DeclarativeRegistry,
  TNode,
> = TNode extends {type: infer TType}
  ? TType extends keyof TRegistry
    ? InstanceType<TRegistry[TType]>
    : never
  : never;

type UnionToIntersection<TUnion> = (
  TUnion extends any
    ? (value: TUnion) => void
    : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type MergeMappedNodes<
  TMapped,
> = UnionToIntersection<TMapped> extends infer TResult
  ? {[K in keyof TResult]: TResult[K]}
  : {};

type ChildrenTypeMap<
  TRegistry extends DeclarativeRegistry,
  TChildren,
> = TChildren extends readonly any[]
  ? MergeMappedNodes<{
      [K in Extract<keyof TChildren, `${number}`>]: NodeTypeMap<TRegistry, TChildren[K], K>;
    }[Extract<keyof TChildren, `${number}`>]>
  : TChildren extends Record<string, any>
    ? MergeMappedNodes<{
        [K in Extract<keyof TChildren, string>]: NodeTypeMap<TRegistry, TChildren[K], K>;
      }[Extract<keyof TChildren, string>]>
    : {};

type NodeTypeMap<
  TRegistry extends DeclarativeRegistry,
  TNode,
  TKey extends string,
> = {
  [K in NodeId<TNode, TKey>]: NodeInstance<TRegistry, TNode>;
} & (TNode extends {children?: infer TChildren}
  ? ChildrenTypeMap<TRegistry, TChildren>
  : {});

export type InferDeclarativeChildrenMap<
  TRegistry extends DeclarativeRegistry,
  TChildren,
> = ChildrenTypeMap<TRegistry, TChildren>;

type TopLevelNodeMap<
  TRegistry extends DeclarativeRegistry,
  TChildren,
> = TChildren extends readonly any[]
  ? {
      [K in Extract<keyof TChildren, `${number}`>]: NodeInstance<TRegistry, TChildren[K]>;
    }
  : TChildren extends Record<string, any>
    ? {
        [K in Extract<keyof TChildren, string>]: NodeInstance<TRegistry, TChildren[K]>;
      }
    : Record<string, BaseComponent<any>>;

export type InferTopLevelComponentMap<
  TRegistry extends DeclarativeRegistry,
  TChildren,
> = TopLevelNodeMap<TRegistry, TChildren>;

export type InferDeclarativeComponentMap<
  TRegistry extends DeclarativeRegistry,
  TConfig extends PortableUiDeclarativeConfig<TRegistry, Record<string, any>>,
> = InferDeclarativeChildrenMap<TRegistry, TConfig['children']>;

export interface PortableUiAdapter<
  TComponentMap extends Record<string, BaseComponent<any>> = Record<string, BaseComponent<any>>,
  TModel extends Record<string, any> = Record<string, any>,
> extends PortableUiBindingHost<TModel> {
  id?: string;
  /** 组件实际挂载的根节点（Shadow 模式下为 Shadow 内的挂载 div，其他模式下为宿主容器本身） */
  root: HTMLElement;
  /**
   * Shadow 模式下的 ShadowRoot，方便使用者直接查询 Shadow 内的原生 DOM。
   * scoped / none 模式下为 null。
   * 示例：`adapter.shadowRoot?.querySelector('.portableui-button')`
   */
  shadowRoot: ShadowRoot | null;
  getComponent<TKey extends Extract<keyof TComponentMap, string>>(id: TKey): TComponentMap[TKey] | null;
  getAllComponents(): BaseComponent<any>[];
  destroy(): void;
}

