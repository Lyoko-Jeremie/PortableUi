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
import type {Tabs} from '../complex/Tabs';
import {Autocomplete} from '../complex/Autocomplete';
import {CascadingSelect} from '../complex/CascadingSelect';
import {Modal} from '../complex/Modal';
import {Progress} from '../complex/Progress';
import {Table} from '../complex/Table';
import {Toast} from '../complex/Toast';
import {TreeView} from '../complex/TreeView';

export type AnyComponentCtor = new (props?: any) => BaseComponent<any>;

/**
 * 从组件构造器中提取 props 类型：
 * - 若构造器参数可为 undefined，则将其视作“无需 props”组件，返回空对象类型；
 * - 否则返回首个构造参数的非空类型。
 */
export type ComponentPropsOf<TCtor extends AnyComponentCtor> = ConstructorParameters<TCtor>[0] extends undefined
  ? Record<string, never>
  : NonNullable<ConstructorParameters<TCtor>[0]>;

/**
 * 组件挂载函数：给定构造器和 props，返回对应组件实例。
 * 由容器在运行时注入，add 对象只负责类型安全地转发调用。
 */
type MountComponentFn = <TCtor extends AnyComponentCtor>(
  ctor: TCtor,
  props: ComponentPropsOf<TCtor>
) => InstanceType<TCtor>;

/**
 * add 对象单个方法的通用签名：
 * 传入某组件 props，返回该组件实例。
 */
type AddMethod<TCtor extends AnyComponentCtor> = (props: ComponentPropsOf<TCtor>) => InstanceType<TCtor>;

// 容器组件类型（仅用于 add 对象方法类型扩展）
export type ContainerComponentCtors = {
  Container: typeof Container;
  Flex: typeof Flex;
  Grid: typeof Grid;
  GridItem: typeof GridItem;
  Group: typeof Group;
};

type ComplexComponentCtors = {
  Tabs: typeof Tabs;
};

export interface ContainerAddTypeExtensions {
  Container: AddMethod<ContainerComponentCtors['Container']>;
  Flex: AddMethod<ContainerComponentCtors['Flex']>;
  Grid: AddMethod<ContainerComponentCtors['Grid']>;
  GridItem: AddMethod<ContainerComponentCtors['GridItem']>;
  Group: AddMethod<ContainerComponentCtors['Group']>;
}

/**
 * 运行时可注册的容器组件构造器表。
 * 设计为 Partial，允许宿主按需注册（例如仅注册 Container）。
 */
const registeredContainerTypeCtors: Partial<ContainerComponentCtors> = {};
const registeredComplexTypeCtors: Partial<ComplexComponentCtors> = {};

/**
 * 解析容器组件构造器：
 * 1) 优先使用对应类型的已注册构造器；
 * 2) 若缺失则回退到 Container 构造器（兼容旧实现/最小注册场景）；
 * 3) 连 Container 都未注册时抛出明确错误。
 */
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

function resolveRegisteredComplexCtor<K extends keyof ComplexComponentCtors>(type: K): ComplexComponentCtors[K] {
  const ctor = registeredComplexTypeCtors[type];
  if (!ctor) {
    throw new Error(`${type} constructor is not registered.`);
  }

  return ctor as ComplexComponentCtors[K];
}

/**
 * `container.add` 对象的实现。
 *
 * 目标：
 * - 暴露统一、可发现的 imperative API（`add.Button(...)`、`add.Flex(...)` 等）；
 * - 通过泛型将 props / 返回实例类型与具体组件精确绑定；
 * - 将真正的挂载细节交由注入的 `mountComponent` 处理，保持该对象职责单一。
 */
export class ContainerAddObject {
  constructor(private readonly mountComponent: MountComponentFn) {}

  /**
   * 原始构造器挂载入口，供内部与高级场景复用。
   */
  mountByCtor<TCtor extends AnyComponentCtor>(ctor: TCtor, props: ComponentPropsOf<TCtor>): InstanceType<TCtor> {
    return this.mountComponent(ctor, props);
  }

  /**
   * add 系列方法的公共实现，语义上表示“按构造器新增子组件”。
   */
  private addByCtor<TCtor extends AnyComponentCtor>(ctor: TCtor, props: ComponentPropsOf<TCtor>): InstanceType<TCtor> {
    return this.mountByCtor(ctor, props);
  }

  // ===== 基础/复杂组件：直接使用静态导入的构造器 =====

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

  Tabs(props: ComponentPropsOf<ComplexComponentCtors['Tabs']>) {
    return this.addByCtor(resolveRegisteredComplexCtor('Tabs'), props);
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

  // ===== 容器类组件：使用运行时注册构造器（支持扩展/替换） =====

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

/**
 * 提供给外部的“具有嵌套 add 方法”的容器能力描述。
 */
export type BuiltInContainerWithNestedAddMethods = {
  add: ContainerAddObject;
};

/**
 * 工厂函数：创建 `ContainerAddObject`，便于在容器初始化阶段注入挂载逻辑。
 */
export function createContainerAddObject(mountComponent: MountComponentFn): ContainerAddObject {
  return new ContainerAddObject(mountComponent);
}

/**
 * 注册容器组件构造器。
 *
 * - 可多次调用，后注册会覆盖同名构造器；
 * - 仅影响容器类方法（Container/Flex/Grid/GridItem/Group）的解析；
 * - 不影响基础组件方法（如 Button/Input），它们始终使用静态导入构造器。
 */
export function registerContainerComponentCtors(ctors: Partial<ContainerComponentCtors>): void {
  Object.assign(registeredContainerTypeCtors, ctors);
}

export function registerComplexComponentCtors(ctors: Partial<ComplexComponentCtors>): void {
  Object.assign(registeredComplexTypeCtors, ctors);
}

