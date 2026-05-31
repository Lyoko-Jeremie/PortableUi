import {BaseComponent} from '../../core';
import {
  Button,
  Canvas,
  Checkbox,
  DatePicker,
  FileUpload,
  HtmlLabel,
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

type MountComponentFn = <TCtor extends AnyComponentCtor>(
  ctor: TCtor,
  props: ComponentPropsOf<TCtor>
) => InstanceType<TCtor>;

type AddMethod<TCtor extends AnyComponentCtor> = (props: ComponentPropsOf<TCtor>) => InstanceType<TCtor>;

// 容器组件类型（仅用于 add 对象方法类型扩展）
export type ContainerComponentCtors = {
  Container: typeof Container;
  Flex: typeof Flex;
  Grid: typeof Grid;
  GridItem: typeof GridItem;
  Group: typeof Group;
};

export interface ContainerAddTypeExtensions {
  Container: AddMethod<ContainerComponentCtors['Container']>;
  Flex: AddMethod<ContainerComponentCtors['Flex']>;
  Grid: AddMethod<ContainerComponentCtors['Grid']>;
  GridItem: AddMethod<ContainerComponentCtors['GridItem']>;
  Group: AddMethod<ContainerComponentCtors['Group']>;
}

const registeredContainerTypeCtors: Partial<ContainerComponentCtors> = {};

function resolveRegisteredContainerCtor<K extends keyof ContainerComponentCtors>(type: K): ContainerComponentCtors[K] {
  const directCtor = registeredContainerTypeCtors[type];
  if (directCtor) {
    return directCtor as ContainerComponentCtors[K];
  }

  const containerCtor = registeredContainerTypeCtors.Container;
  if (!containerCtor) {
    throw new Error('Container constructor is not registered.');
  }

  return containerCtor as unknown as ContainerComponentCtors[K];
}

export class ContainerAddObject {
  constructor(private readonly mountComponent: MountComponentFn) {}

  mountByCtor<TCtor extends AnyComponentCtor>(ctor: TCtor, props: ComponentPropsOf<TCtor>): InstanceType<TCtor> {
    return this.mountComponent(ctor, props);
  }

  private addByCtor<TCtor extends AnyComponentCtor>(ctor: TCtor, props: ComponentPropsOf<TCtor>): InstanceType<TCtor> {
    return this.mountByCtor(ctor, props);
  }

  Autocomplete(props: ComponentPropsOf<typeof Autocomplete>) {
    return this.addByCtor(Autocomplete, props);
  }

  Button(props: ComponentPropsOf<typeof Button>) {
    return this.addByCtor(Button, props);
  }

  Canvas(props: ComponentPropsOf<typeof Canvas>) {
    return this.addByCtor(Canvas, props);
  }

  CascadingSelect(props: ComponentPropsOf<typeof CascadingSelect>) {
    return this.addByCtor(CascadingSelect, props);
  }

  Checkbox(props: ComponentPropsOf<typeof Checkbox>) {
    return this.addByCtor(Checkbox, props);
  }

  DatePicker(props: ComponentPropsOf<typeof DatePicker>) {
    return this.addByCtor(DatePicker, props);
  }

  FileUpload(props: ComponentPropsOf<typeof FileUpload>) {
    return this.addByCtor(FileUpload, props);
  }

  Image(props: ComponentPropsOf<typeof Image>) {
    return this.addByCtor(Image, props);
  }

  Input(props: ComponentPropsOf<typeof Input>) {
    return this.addByCtor(Input, props);
  }

  Label(props: ComponentPropsOf<typeof Label>) {
    return this.addByCtor(Label, props);
  }

  HtmlLabel(props: ComponentPropsOf<typeof HtmlLabel>) {
    return this.addByCtor(HtmlLabel, props);
  }

  Modal(props: ComponentPropsOf<typeof Modal>) {
    return this.addByCtor(Modal, props);
  }

  Progress(props: ComponentPropsOf<typeof Progress>) {
    return this.addByCtor(Progress, props);
  }

  Radio(props: ComponentPropsOf<typeof Radio>) {
    return this.addByCtor(Radio, props);
  }

  Select(props: ComponentPropsOf<typeof Select>) {
    return this.addByCtor(Select, props);
  }

  Slider(props: ComponentPropsOf<typeof Slider>) {
    return this.addByCtor(Slider, props);
  }

  Table(props: ComponentPropsOf<typeof Table>) {
    return this.addByCtor(Table, props);
  }

  Tabs(props: ComponentPropsOf<typeof Tabs>) {
    return this.addByCtor(Tabs, props);
  }

  TextBox(props: ComponentPropsOf<typeof TextBox>) {
    return this.addByCtor(TextBox, props);
  }

  Toast(props: ComponentPropsOf<typeof Toast>) {
    return this.addByCtor(Toast, props);
  }

  TreeView(props: ComponentPropsOf<typeof TreeView>) {
    return this.addByCtor(TreeView, props);
  }

  Container(props: ComponentPropsOf<ContainerComponentCtors['Container']>) {
    return this.mountByCtor(resolveRegisteredContainerCtor('Container'), props);
  }

  Flex(props: ComponentPropsOf<ContainerComponentCtors['Flex']>) {
    return this.mountByCtor(resolveRegisteredContainerCtor('Flex'), props);
  }

  Grid(props: ComponentPropsOf<ContainerComponentCtors['Grid']>) {
    return this.mountByCtor(resolveRegisteredContainerCtor('Grid'), props);
  }

  GridItem(props: ComponentPropsOf<ContainerComponentCtors['GridItem']>) {
    return this.mountByCtor(resolveRegisteredContainerCtor('GridItem'), props);
  }

  Group(props: ComponentPropsOf<ContainerComponentCtors['Group']>) {
    return this.mountByCtor(resolveRegisteredContainerCtor('Group'), props);
  }
}

// 通过类型扩展将容器类 add 方法并入对象类型。
export interface ContainerAddObject extends ContainerAddTypeExtensions {}

export type BuiltInContainerWithNestedAddMethods = {
  add: ContainerAddObject;
};

export function createContainerAddObject(mountComponent: MountComponentFn): ContainerAddObject {
  return new ContainerAddObject(mountComponent);
}

/**
 * 注册容器组件构造器：直接更新 add 对象使用的类型构造器。
 */
export function registerContainerComponentCtors(ctors: Partial<ContainerComponentCtors>): void {
  Object.assign(registeredContainerTypeCtors, ctors);
}
