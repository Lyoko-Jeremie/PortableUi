import {BaseComponent} from '../core';
import {Button, type ButtonProps, Input, type InputProps} from '../components/basic';
import {Container, type ContainerProps} from '../components/container';

type ComponentPropsOf<TComponent extends BaseComponent> = ConstructorParameters<
  new (props?: any) => TComponent
>[0] extends undefined
  ? Record<string, never>
  : NonNullable<ConstructorParameters<new (props?: any) => TComponent>[0]>;

export interface AppOptions {
  id?: string;
  rootProps?: Omit<ContainerProps, 'id'>;
}

export interface AppTabOptions extends Omit<ContainerProps, 'children'> {
  id: string;
}

export class AppScope {
  constructor(
    protected mountPoint: HTMLElement,
    protected readonly components: Map<string, BaseComponent>,
    protected readonly mountOrder: BaseComponent[]
  ) {}

  addButton(props: ButtonProps): Button {
    return this.mountComponent(Button, props);
  }

  addInput(props: InputProps): Input {
    return this.mountComponent(Input, props);
  }

  addTab(options: AppTabOptions): AppScope {
    const className = options.className ? `${options.className} portableui-app-tab` : 'portableui-app-tab';
    const tab = this.mountComponent(Container, {
      direction: 'vertical',
      ...options,
      className,
    });

    const tabElement = tab.getElement();
    if (!tabElement) {
      throw new Error(`Failed to mount tab: ${options.id}`);
    }

    return new AppScope(tabElement, this.components, this.mountOrder);
  }

  addComponent<TComponent extends BaseComponent>(
    ctor: new (props?: any) => TComponent,
    props: ComponentPropsOf<TComponent>
  ): TComponent {
    return this.mountComponent(ctor, props);
  }

  protected mountComponent<TComponent extends BaseComponent>(
    ctor: new (props?: any) => TComponent,
    props: ComponentPropsOf<TComponent>
  ): TComponent {
    const instance = new ctor(props);
    const id = instance.getId();

    if (id && this.components.has(id)) {
      throw new Error(`Duplicate component id: ${id}`);
    }

    instance.mount(this.mountPoint);

    if (id) {
      this.components.set(id, instance);
    }

    this.mountOrder.push(instance);
    return instance;
  }
}

export class App extends AppScope {
  readonly root: HTMLElement;
  private readonly host: HTMLElement;

  constructor(container: HTMLElement, options: AppOptions = {}) {
    if (!container) {
      throw new Error('App requires a valid container element.');
    }

    const components = new Map<string, BaseComponent>();
    const mountOrder: BaseComponent[] = [];
    super(container, components, mountOrder);

    this.host = container;

    const rootContainer = new Container({
      direction: 'vertical',
      ...options.rootProps,
      ...(options.id ? {id: options.id} : {}),
    });

    const rootId = rootContainer.getId();
    if (rootId && components.has(rootId)) {
      throw new Error(`Duplicate component id: ${rootId}`);
    }

    rootContainer.mount(container);

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
  }

  getComponent<TComponent extends BaseComponent = BaseComponent>(id: string): TComponent | null {
    return (this.components.get(id) as TComponent | undefined) ?? null;
  }

  getAllComponents(): BaseComponent[] {
    return Array.from(this.components.values());
  }

  destroy(): void {
    for (let i = this.mountOrder.length - 1; i >= 0; i -= 1) {
      const component = this.mountOrder[i];
      if (!component) {
        continue;
      }

      const id = component.getId();
      component.unmount();
      if (id) {
        this.components.delete(id);
      }
    }

    this.mountOrder.length = 0;
  }

  getHost(): HTMLElement {
    return this.host;
  }
}


