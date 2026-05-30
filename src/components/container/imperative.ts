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
  Container: new (props?: any) => BaseComponent;
  Flex: new (props?: any) => BaseComponent;
  Grid: new (props?: any) => BaseComponent;
  GridItem: new (props?: any) => BaseComponent;
  Group: new (props?: any) => BaseComponent;
};

export type BuiltInContainerWithNestedRegistry = BuiltInContainerChildRegistry & ContainerComponentCtors;
export type BuiltInContainerWithNestedAddMethods = GeneratedAddMethods<BuiltInContainerWithNestedRegistry>;

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

