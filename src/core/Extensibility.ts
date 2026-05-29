import type {ComponentProps, LifecycleMethod} from '../types';
import type {BaseComponent} from './BaseComponent';

export interface MiddlewareContext {
  phase: LifecycleMethod;
  component: BaseComponent;
  payload?: unknown;
  cancel: boolean;
  metadata: Record<string, unknown>;
}

export type Middleware = (context: MiddlewareContext, next: () => void) => void;

export type ExtensibilityHook =
  | 'beforeMount'
  | 'afterMount'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeUnmount'
  | 'afterUnmount'
  | 'cancelled'
  | 'error';

export type HookHandler = (component: BaseComponent, payload?: unknown) => void;

export type ComponentConstructor<P extends ComponentProps = ComponentProps> = new (props?: P) => BaseComponent;

export interface PluginAPI {
  registerComponent: <P extends ComponentProps>(name: string, component: ComponentConstructor<P>) => void;
  unregisterComponent: (name: string) => boolean;
  hasComponent: (name: string) => boolean;
  useMiddleware: (middleware: Middleware) => () => void;
  tapHook: (hook: ExtensibilityHook, handler: HookHandler) => () => void;
}

export interface PortableUiPlugin {
  name: string;
  version?: string;
  install: (api: PluginAPI) => void;
  uninstall?: (api: PluginAPI) => void;
}

export interface CustomComponentDefinition<P extends ComponentProps = ComponentProps> {
  defaultProps?: Partial<P>;
  render: (props: P, self: BaseComponent) => HTMLElement;
}

class MiddlewareManager {
  private middlewares: Middleware[] = [];

  use(middleware: Middleware): () => void {
    this.middlewares.push(middleware);
    return () => {
      this.middlewares = this.middlewares.filter((item) => item !== middleware);
    };
  }

  run(context: MiddlewareContext, terminal: () => void): void {
    let index = -1;

    const dispatch = (currentIndex: number): void => {
      if (currentIndex <= index) {
        throw new Error('Middleware next() called multiple times');
      }

      index = currentIndex;
      const middleware = this.middlewares[currentIndex];
      if (!middleware) {
        terminal();
        return;
      }

      middleware(context, () => dispatch(currentIndex + 1));
    };

    dispatch(0);
  }
}

class HookManager {
  private hooks: Map<ExtensibilityHook, Set<HookHandler>> = new Map();

  tap(hook: ExtensibilityHook, handler: HookHandler): () => void {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, new Set());
    }

    this.hooks.get(hook)?.add(handler);
    return () => {
      this.hooks.get(hook)?.delete(handler);
    };
  }

  emit(hook: ExtensibilityHook, component: BaseComponent, payload?: unknown): void {
    const handlers = this.hooks.get(hook);
    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => {
      handler(component, payload);
    });
  }
}

class ComponentRegistry {
  private components: Map<string, ComponentConstructor<any>> = new Map();

  register<P extends ComponentProps>(name: string, component: ComponentConstructor<P>): void {
    if (!name.trim()) {
      throw new Error('Component name is required');
    }

    this.components.set(name, component);
  }

  unregister(name: string): boolean {
    return this.components.delete(name);
  }

  has(name: string): boolean {
    return this.components.has(name);
  }

  create<P extends ComponentProps>(name: string, props?: P): BaseComponent {
    const component = this.components.get(name);
    if (!component) {
      throw new Error(`Component "${name}" is not registered`);
    }

    return new component(props);
  }

  list(): string[] {
    return Array.from(this.components.keys());
  }
}

class PluginManager {
  private plugins: Map<string, PortableUiPlugin> = new Map();

  constructor(private readonly api: PluginAPI) {}

  use(plugin: PortableUiPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already installed`);
    }

    plugin.install(this.api);
    this.plugins.set(plugin.name, plugin);
  }

  uninstall(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return false;
    }

    plugin.uninstall?.(this.api);
    return this.plugins.delete(name);
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  list(): string[] {
    return Array.from(this.plugins.keys());
  }
}

function getBeforeHook(phase: LifecycleMethod): ExtensibilityHook {
  if (phase === 'mount') return 'beforeMount';
  if (phase === 'update') return 'beforeUpdate';
  return 'beforeUnmount';
}

function getAfterHook(phase: LifecycleMethod): ExtensibilityHook {
  if (phase === 'mount') return 'afterMount';
  if (phase === 'update') return 'afterUpdate';
  return 'afterUnmount';
}

export class ExtensibilityManager {
  readonly components = new ComponentRegistry();
  readonly hooks = new HookManager();
  readonly middleware = new MiddlewareManager();

  private readonly pluginApi: PluginAPI = {
    registerComponent: (name, component) => this.components.register(name, component),
    unregisterComponent: (name) => this.components.unregister(name),
    hasComponent: (name) => this.components.has(name),
    useMiddleware: (middleware) => this.middleware.use(middleware),
    tapHook: (hook, handler) => this.hooks.tap(hook, handler)
  };

  readonly plugins = new PluginManager(this.pluginApi);

  runLifecycle(
    phase: LifecycleMethod,
    component: BaseComponent,
    payload: unknown,
    operation: () => void
  ): void {
    const context: MiddlewareContext = {
      phase,
      component,
      payload,
      cancel: false,
      metadata: {}
    };

    try {
      this.hooks.emit(getBeforeHook(phase), component, payload);

      this.middleware.run(context, () => {
        if (!context.cancel) {
          operation();
        }
      });

      if (context.cancel) {
        this.hooks.emit('cancelled', component, {phase, payload});
        return;
      }

      this.hooks.emit(getAfterHook(phase), component, payload);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      this.hooks.emit('error', component, normalizedError);
      throw normalizedError;
    }
  }
}

export const extensibilityManager = new ExtensibilityManager();


