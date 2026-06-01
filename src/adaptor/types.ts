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

type PortableUiBindingValue<TModel extends Record<string, any>> =
  | PortableUiReadableBindingSource<any, TModel>
  | PortableUiWritableBindingSource<any, TModel>
  | PortableUiCallbackSource<TModel>;

export type PortableUiBindingMap<
  TProps extends Record<string, any> = Record<string, any>,
  TModel extends Record<string, any> = Record<string, any>,
> = {
  [K in PortableUiWritableBindingField]?: PortableUiWritableBindingSource<any, TModel>;
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
}

export interface PortableUiBindingHost<TModel extends Record<string, any> = Record<string, any>> {
  boundModel: TModel;
  getModel<TResolvedModel extends TModel = TModel>(): TResolvedModel;
  markDirty(path?: string): void;
}

export interface BindingContext<TModel extends Record<string, any> = Record<string, any>> {
  model: TModel;
  component: BaseComponent<any>;
  adapter?: PortableUiBindingHost<TModel>;
  app?: PortableUiBindingHost<TModel>;
  markDirty: (path?: string) => void;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  warn: (code: string, detail?: Record<string, any>) => void;
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

