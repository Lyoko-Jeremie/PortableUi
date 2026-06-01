import {BaseComponent} from '../core';
import {
  Autocomplete,
  CascadingSelect,
  Modal,
  Progress,
  Table,
  Tabs,
  Toast,
  TreeView,
} from '../components/complex';
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
} from '../components/basic';
import {Container, Flex, Grid, GridItem, Group, type ContainerProps} from '../components/container';
import {BindingEngine} from './binding';
import type {BindableComponentProps, BindingOptions, DeclarativeRegistry, ObjectKeyPathOf, StyleIsolationConfig} from './types';

const PORTABLEUI_SCOPE_ATTR = 'data-portableui-root';
const PORTABLEUI_MOUNT_ATTR = 'data-portableui-mount-root';
const PORTABLEUI_STYLE_ATTR = 'data-portableui-style';

type AnyComponentCtor = new (props?: any) => BaseComponent;

type RawComponentPropsOf<TCtor extends AnyComponentCtor> = ConstructorParameters<TCtor>[0] extends undefined
  ? Record<string, never>
  : NonNullable<ConstructorParameters<TCtor>[0]>;

type ComponentPropsOf<TCtor extends AnyComponentCtor> = RawComponentPropsOf<TCtor> & BindableComponentProps<RawComponentPropsOf<TCtor>>;

type GeneratedAddMethods<TRegistry extends DeclarativeRegistry> = {
  [K in Extract<keyof TRegistry, string>]: (
    props: ComponentPropsOf<TRegistry[K]>
  ) => InstanceType<TRegistry[K]>;
};

type AppScopeAddMethods<TRegistry extends DeclarativeRegistry> = GeneratedAddMethods<TRegistry> & {
  tab: (options: AppTabOptions) => AppScope<TRegistry>;
};

const builtInComponentRegistry = {
  Autocomplete,
  Button,
  Canvas,
  CascadingSelect,
  Checkbox,
  Container,
  DatePicker,
  FileUpload,
  Flex,
  Grid,
  GridItem,
  Group,
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
} satisfies DeclarativeRegistry;

export type BuiltInDeclarativeRegistry = typeof builtInComponentRegistry;
export type BuiltInAddMethods = {
  add: AppScopeAddMethods<BuiltInDeclarativeRegistry>;
};

export interface AppOptions {
  id?: string;
  rootProps?: Omit<ContainerProps, 'id'> & BindableComponentProps<Omit<ContainerProps, 'id'>>;
  styleIsolation?: StyleIsolationConfig;
  model?: Record<string, any>;
  bindings?: Record<string, Record<string, any>>;
  bindingOptions?: BindingOptions;
}

export interface AppTabOptions extends Omit<ContainerProps, 'children'> {
  id: string;
}

function injectStyleOnce(target: ParentNode, styleText?: string): void {
  if (!styleText || !styleText.trim()) {
    return;
  }

  const existing = target.querySelector(`style[${PORTABLEUI_STYLE_ATTR}="true"]`);
  if (existing) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute(PORTABLEUI_STYLE_ATTR, 'true');
  style.textContent = styleText;
  target.appendChild(style);
}

function resolveMountRoot(container: HTMLElement, styleIsolation?: StyleIsolationConfig): HTMLElement {
  const mode = styleIsolation?.mode ?? 'shadow';

  if (mode === 'none') {
    return container;
  }

  if (mode === 'scoped') {
    container.setAttribute(PORTABLEUI_SCOPE_ATTR, 'scoped');
    injectStyleOnce(container, styleIsolation?.styles);
    return container;
  }

  container.setAttribute(PORTABLEUI_SCOPE_ATTR, 'shadow-host');

  const shadowRoot = container.shadowRoot ?? container.attachShadow({mode: 'open'});
  injectStyleOnce(shadowRoot, styleIsolation?.styles);

  const existingMountRoot = Array.from(shadowRoot.children).find(
    (child): child is HTMLElement => child instanceof HTMLElement && child.getAttribute(PORTABLEUI_MOUNT_ATTR) === 'true'
  );

  if (existingMountRoot) {
    return existingMountRoot;
  }

  const mountRoot = document.createElement('div');
  mountRoot.setAttribute(PORTABLEUI_MOUNT_ATTR, 'true');
  mountRoot.setAttribute(PORTABLEUI_SCOPE_ATTR, 'shadow');
  shadowRoot.appendChild(mountRoot);
  return mountRoot;
}

class AppScopeBase<TRegistry extends DeclarativeRegistry = BuiltInDeclarativeRegistry> {
  readonly add: AppScopeAddMethods<TRegistry>;

  constructor(
    protected mountPoint: HTMLElement,
    protected readonly components: Map<string, BaseComponent>,
    protected readonly mountOrder: BaseComponent[],
    protected readonly registry: TRegistry,
    protected readonly bindingEngine: BindingEngine<Record<string, any>>
  ) {
    this.add = {} as AppScopeAddMethods<TRegistry>;
    this.installGeneratedAddMethods();
  }

  protected createTabScope(options: AppTabOptions): AppScope<TRegistry> {
    const className = options.className ? `${options.className} portableui-app-tab` : 'portableui-app-tab';
    const tab = this.mountComponent(Container, {
      ...options,
      className,
      direction: 'vertical',
    });

    const tabElement = tab.getElement();
    if (!tabElement) {
      throw new Error(`Failed to mount tab: ${options.id}`);
    }

    return new AppScopeBase(tabElement, this.components, this.mountOrder, this.registry, this.bindingEngine) as AppScope<TRegistry>;
  }

  protected mountComponent<TCtor extends AnyComponentCtor>(ctor: TCtor, props: ComponentPropsOf<TCtor>): InstanceType<TCtor> {
    const componentKey = props.id ?? `${ctor.name}_${this.mountOrder.length}`;
    const prepared = this.bindingEngine.prepareComponentBindings(componentKey, props.id ?? componentKey, props as Record<string, any>);
    const instance = new ctor(prepared.props);
    const id = instance.getId();

    if (id && this.components.has(id)) {
      throw new Error(`Duplicate component id: ${id}`);
    }

    instance.mount(this.mountPoint);

    if (id) {
      this.components.set(id, instance);
    }

    this.bindingEngine.attachComponent(prepared, instance);
    this.mountOrder.push(instance);
    return instance as InstanceType<TCtor>;
  }

  private installGeneratedAddMethods(): void {
    if (!Object.prototype.hasOwnProperty.call(this.add, 'tab')) {
      Object.defineProperty(this.add, 'tab', {
        configurable: true,
        enumerable: false,
        writable: true,
        value: (options: AppTabOptions) => this.createTabScope(options),
      });
    }

    for (const [type, ctor] of Object.entries(this.registry) as Array<[
      Extract<keyof TRegistry, string>,
      TRegistry[Extract<keyof TRegistry, string>]
    ]>) {
      if (Object.prototype.hasOwnProperty.call(this.add, type)) {
        continue;
      }

      const componentCtor = ctor as AnyComponentCtor;
      Object.defineProperty(this.add, type, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: (props: ComponentPropsOf<typeof componentCtor>) => this.mountComponent(componentCtor, props),
      });
    }
  }
}

export type AppScope<TRegistry extends DeclarativeRegistry = BuiltInDeclarativeRegistry> =
  AppScopeBase<TRegistry> & {add: AppScopeAddMethods<TRegistry>};

export class App extends AppScopeBase<BuiltInDeclarativeRegistry> {
  readonly boundModel: Record<string, any>;
  readonly root: HTMLElement;
  private readonly host: HTMLElement;

  constructor(container: HTMLElement, options: AppOptions = {}) {
    if (!container) {
      throw new Error('App requires a valid container element.');
    }

    const components = new Map<string, BaseComponent>();
    const mountOrder: BaseComponent[] = [];
    const mountRoot = resolveMountRoot(container, options.styleIsolation);
    const bindingEngine = new BindingEngine<Record<string, any>>({
      ownerType: 'app',
      ...(options.model ? {model: options.model} : {}),
      ...(options.bindings ? {bindings: options.bindings} : {}),
      ...(options.bindingOptions ? {options: options.bindingOptions} : {}),
    });
    super(mountRoot, components, mountOrder, builtInComponentRegistry, bindingEngine);

    this.host = container;
    this.boundModel = bindingEngine.getModel();

    const rootContainer = new Container({
      direction: 'vertical',
      ...options.rootProps,
      ...(options.id ? {id: options.id} : {}),
    });

    const rootId = rootContainer.getId();
    if (rootId && components.has(rootId)) {
      throw new Error(`Duplicate component id: ${rootId}`);
    }

    rootContainer.mount(mountRoot);

    if (rootId) {
      components.set(rootId, rootContainer);
    }

    mountOrder.push(rootContainer);

    const rootElement = rootContainer.getElement();
    if (!rootElement) {
      throw new Error('Failed to mount root app container.');
    }

    this.root = rootElement;
    this.mountPoint = this.root;
    this.bindingEngine.setOwner(this);
  }

  getModel<TModel extends Record<string, any> = Record<string, any>>(): TModel {
    return this.bindingEngine.getModel() as TModel;
  }

  /**
   * 标记对象路径脏，触发双向绑定刷新
   * - 旧用法：markDirty('path.to.field') - 路径字符串，针对全局 model
   * - 新用法：markDirty(target, 'key.path') - 对象级脏标记，针对组件绑定的数据对象
   */
  markDirty(path: string): void;
  markDirty<T extends Record<string, any>>(target: T, key?: ObjectKeyPathOf<T>): void;
  markDirty(target: object | string, key?: string): void {
    if (typeof target === 'string') {
      // 旧用法：路径字符串
      this.bindingEngine.markDirty(target);
    } else {
      // 新用法：对象级
      this.bindingEngine.markDirtyObject(target, key);
    }
  }

  /**
   * 标记整个对象为脏，触发全部相关绑定刷新（不指定具体路径）
   */
  markDirtyAll(target: object): void {
    this.bindingEngine.markDirtyAll(target);
  }

  getComponent<TComponent extends BaseComponent = BaseComponent>(id: string): TComponent | null {
    return (this.components.get(id) as TComponent | undefined) ?? null;
  }

  getAllComponents(): BaseComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * 返回宿主元素的 ShadowRoot（Shadow 模式下有效，其他模式返回 null）。
   * 可通过它直接查询 Shadow 内的原生 DOM：
   *   `app.getShadowRoot()?.querySelector('.portableui-button')`
   */
  getShadowRoot(): ShadowRoot | null {
    return this.host.shadowRoot ?? null;
  }

  /**
   * Shadow 模式下的 ShadowRoot 快捷属性，与 getShadowRoot() 等价。
   */
  get shadowRoot(): ShadowRoot | null {
    return this.getShadowRoot();
  }

  destroy(): void {
    for (let i = this.mountOrder.length - 1; i >= 0; i -= 1) {
      const component = this.mountOrder[i];
      if (!component) {
        continue;
      }

      const id = component.getId();
      this.bindingEngine.detachComponent(id);
      component.unmount();
      if (id) {
        this.components.delete(id);
      }
    }

    this.mountOrder.length = 0;
    this.bindingEngine.destroy();
  }
}

