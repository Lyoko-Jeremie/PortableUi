import {BaseComponent} from '../core';

export type ComponentCtor<
  TProps extends Record<string, any> = Record<string, any>,
  TInstance extends BaseComponent = BaseComponent,
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

export interface PortableUiDeclarativeConfig<TRegistry extends DeclarativeRegistry> {
  id?: string;
  children: DeclarativeChildren<TRegistry>;
}

export interface PortableUiAdapter {
  id?: string;
  root: HTMLElement;
  getComponent<T extends BaseComponent = BaseComponent>(id: string): T | null;
  getAllComponents(): BaseComponent[];
  destroy(): void;
}

