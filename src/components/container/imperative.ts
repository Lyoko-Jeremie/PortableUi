import {BaseComponent} from '../../core';
import {
  Button,
  Canvas,
  Checkbox,
  DatePicker,
  FileUpload,
  Image,
  Input,
  Label,
  Radio,
  Select,
  Slider,
  TextBox,
} from '../basic';
import type {Container} from './Container';
import type {Flex} from './Flex';
import type {Grid, GridItem} from './Grid';
import type {Group} from './Group';
import {
  Autocomplete,
  CascadingSelect,
  Modal,
  Progress,
  Table,
  Tabs,
  Toast,
  TreeView,
} from '../complex';

export type AnyComponentCtor = new (props?: any) => BaseComponent;

export type ComponentPropsOf<TCtor extends AnyComponentCtor> = ConstructorParameters<TCtor>[0] extends undefined
  ? Record<string, never>
  : NonNullable<ConstructorParameters<TCtor>[0]>;

type AddMethodName<TKey extends string> = `add${TKey}`;

export type GeneratedAddMethods<TRegistry extends Record<string, AnyComponentCtor>> = {
  [K in Extract<keyof TRegistry, string> as AddMethodName<K>]: (
    props: ComponentPropsOf<TRegistry[K]>
  ) => InstanceType<TRegistry[K]>;
};

export const builtInContainerChildRegistry = {
  Autocomplete,
  Button,
  Canvas,
  CascadingSelect,
  Checkbox,
  DatePicker,
  FileUpload,
  Image,
  Input,
  Label,
  Modal,
  Progress,
  Radio,
  Select,
  Slider,
  Table,
  Tabs,
  TextBox,
  Toast,
  TreeView,
} satisfies Record<string, AnyComponentCtor>;

export type BuiltInContainerChildRegistry = typeof builtInContainerChildRegistry;

// 容器组件的延迟导入类型（避免循环依赖）
export type ContainerComponentCtors = {
  Container: typeof Container;
  Flex: typeof Flex;
  Grid: typeof Grid;
  GridItem: typeof GridItem;
  Group: typeof Group;
};

export type BuiltInContainerWithNestedRegistry = BuiltInContainerChildRegistry & ContainerComponentCtors;
export type BuiltInContainerWithNestedAddMethods = GeneratedAddMethods<BuiltInContainerWithNestedRegistry>;

let registeredContainerComponentCtors: Partial<ContainerComponentCtors> = {};

/**
 * 注册容器组件构造器，避免在运行时使用 require()/import()。
 */
export function registerContainerComponentCtors(ctors: Partial<ContainerComponentCtors>): void {
  registeredContainerComponentCtors = {
    ...registeredContainerComponentCtors,
    ...ctors,
  };
}

/**
 * 获取已注册的容器组件构造器。
 */
export function getContainerComponentCtors(): ContainerComponentCtors {
  const containerCtor = registeredContainerComponentCtors.Container;
  if (!containerCtor) {
    throw new Error('Container constructor is not registered.');
  }

  const flexCtor = registeredContainerComponentCtors.Flex ?? (containerCtor as unknown as ContainerComponentCtors['Flex']);
  const gridCtor = registeredContainerComponentCtors.Grid ?? (containerCtor as unknown as ContainerComponentCtors['Grid']);
  const gridItemCtor = registeredContainerComponentCtors.GridItem ?? (containerCtor as unknown as ContainerComponentCtors['GridItem']);
  const groupCtor = registeredContainerComponentCtors.Group ?? (containerCtor as unknown as ContainerComponentCtors['Group']);

  return {
    Container: containerCtor,
    Flex: flexCtor,
    Grid: gridCtor,
    GridItem: gridItemCtor,
    Group: groupCtor,
  };
}

export function installGeneratedAddMethods<TRegistry extends Record<string, AnyComponentCtor>>(
  target: object,
  registry: TRegistry,
  mountComponent: <TCtor extends AnyComponentCtor>(ctor: TCtor, props: ComponentPropsOf<TCtor>) => InstanceType<TCtor>
): void {
  for (const [type, ctor] of Object.entries(registry) as Array<[
    Extract<keyof TRegistry, string>,
    TRegistry[Extract<keyof TRegistry, string>]
  ]>) {
    const methodName = `add${type}` as AddMethodName<Extract<keyof TRegistry, string>>;
    if (Object.prototype.hasOwnProperty.call(target, methodName)) {
      continue;
    }

    const componentCtor = ctor as AnyComponentCtor;
    Object.defineProperty(target, methodName, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: (props: ComponentPropsOf<typeof componentCtor>) => mountComponent(componentCtor, props),
    });
  }
}

