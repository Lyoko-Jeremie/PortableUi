import {BaseComponent} from '../core';

export type ComponentCtor<
  TProps extends Record<string, any> = Record<string, any>,
  TInstance extends BaseComponent<any> = BaseComponent<any>,
> = new (props?: TProps) => TInstance;

export type DeclarativeRegistry = Record<string, ComponentCtor>;

type ConstructorProps<TCtor extends ComponentCtor> = ConstructorParameters<TCtor>[0] extends undefined
  ? Record<string, never>
  : NonNullable<ConstructorParameters<TCtor>[0]>;

type DeclarativeProps<
  TRegistry extends DeclarativeRegistry,
  TType extends Extract<keyof TRegistry, string>,
> = TType extends 'Button'
  ? ConstructorProps<TRegistry[TType]> & {label?: string}
  : ConstructorProps<TRegistry[TType]>;

export type DeclarativeComponentNode<
  TRegistry extends DeclarativeRegistry,
  TType extends Extract<keyof TRegistry, string> = Extract<keyof TRegistry, string>,
> = {
  type: TType;
  props?: DeclarativeProps<TRegistry, TType>;
  children?: DeclarativeChildren<TRegistry>;
};

export type DeclarativeNodeUnion<TRegistry extends DeclarativeRegistry> = {
  [TType in Extract<keyof TRegistry, string>]: DeclarativeComponentNode<TRegistry, TType>;
}[Extract<keyof TRegistry, string>];

export type DeclarativeChildren<TRegistry extends DeclarativeRegistry> =
  | Record<string, DeclarativeNodeUnion<TRegistry>>
  | DeclarativeNodeUnion<TRegistry>[];

export type StyleIsolationMode = 'none' | 'scoped' | 'shadow';

export interface StyleIsolationConfig {
  mode?: StyleIsolationMode;
  styles?: string;
}

export interface PortableUiDeclarativeConfig<TRegistry extends DeclarativeRegistry> {
  id?: string;
  children: DeclarativeChildren<TRegistry>;
  styleIsolation?: StyleIsolationConfig;
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
  TConfig extends PortableUiDeclarativeConfig<TRegistry>,
> = InferDeclarativeChildrenMap<TRegistry, TConfig['children']>;

export interface PortableUiAdapter<TComponentMap extends Record<string, BaseComponent<any>> = Record<string, BaseComponent<any>>> {
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

