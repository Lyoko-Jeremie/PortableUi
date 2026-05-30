import {BaseComponent} from '../core';
import {
  ComponentCtor,
  DeclarativeChildren,
  DeclarativeNodeUnion,
  DeclarativeRegistry,
  InferTopLevelComponentMap,
  PortableUiAdapter,
  StyleIsolationConfig,
} from './types';
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
import {Container, Flex, Grid, GridItem, Group} from '../components/container';

interface PortableUiCreateConfig<TChildren> {
  id?: string;
  children: TChildren;
  styleIsolation?: StyleIsolationConfig;
}

const PORTABLEUI_SCOPE_ATTR = 'data-portableui-root';
const PORTABLEUI_MOUNT_ATTR = 'data-portableui-mount-root';
const PORTABLEUI_STYLE_ATTR = 'data-portableui-style';

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

function toEntries<TRegistry extends DeclarativeRegistry>(
  children: DeclarativeChildren<TRegistry> | undefined
): Array<[string, DeclarativeNodeUnion<TRegistry>]> {
  if (!children) {
    return [];
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => [String(index), child]);
  }

  return Object.entries(children);
}

function normalizeProps(type: string, props: Record<string, any>, fallbackId: string): Record<string, any> {
  const normalized = {...props};

  if (!normalized.id && fallbackId) {
    normalized.id = fallbackId;
  }

  // Support declarative naming style in docs: label -> text for Button.
  if (type === 'Button' && normalized.text === undefined && typeof normalized.label === 'string') {
    normalized.text = normalized.label;
  }

  return normalized;
}

function mountNode<TRegistry extends DeclarativeRegistry>(
  registry: TRegistry,
  key: string,
  node: DeclarativeNodeUnion<TRegistry>,
  parent: HTMLElement,
  components: Map<string, BaseComponent>
): void {
  const ctor = registry[node.type];
  if (!ctor) {
    throw new Error(`Unknown component type: ${node.type}`);
  }

  const props = normalizeProps(node.type, node.props ?? {}, key);
  const instance = new ctor(props);
  const id = instance.getId();

  if (id && components.has(id)) {
    throw new Error(`Duplicate component id: ${id}`);
  }

  instance.mount(parent);

  if (id) {
    components.set(id, instance);
  }

  const element = instance.getElement();
  if (!element) {
    return;
  }

  for (const [childKey, childNode] of toEntries(node.children)) {
    mountNode(registry, childKey, childNode, element, components);
  }
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

export function CreatePortableUi<
  const TChildren,
>(
  container: HTMLElement,
  config: PortableUiCreateConfig<TChildren>
): PortableUiAdapter<InferTopLevelComponentMap<BuiltInDeclarativeRegistry, TChildren>>;
export function CreatePortableUi<
  TRegistry extends DeclarativeRegistry,
  const TChildren,
>(
  container: HTMLElement,
  config: PortableUiCreateConfig<TChildren>,
  registry: TRegistry
): PortableUiAdapter<InferTopLevelComponentMap<TRegistry, TChildren>>;
export function CreatePortableUi(
  container: HTMLElement,
  config: PortableUiCreateConfig<unknown>,
  registry?: DeclarativeRegistry
): PortableUiAdapter<Record<string, BaseComponent>> {
  if (!container) {
    throw new Error('CreatePortableUi requires a valid container element.');
  }

  const components = new Map<string, BaseComponent>();

  if (config.id) {
    container.setAttribute('data-portableui-id', config.id);
  }

  const mountRoot = resolveMountRoot(container, config.styleIsolation);

  const effectiveRegistry = (registry ?? builtInComponentRegistry) as DeclarativeRegistry;

  for (const [key, node] of toEntries(config.children as DeclarativeChildren<DeclarativeRegistry>)) {
    mountNode(effectiveRegistry, key, node as DeclarativeNodeUnion<DeclarativeRegistry>, mountRoot, components);
  }

  const adapter: PortableUiAdapter<Record<string, BaseComponent>> = {
    root: mountRoot,
    getComponent<TKey extends string>(id: TKey): BaseComponent | null {
      return components.get(id) ?? null;
    },
    getAllComponents(): BaseComponent[] {
      return Array.from(components.values());
    },
    destroy(): void {
      const instances = Array.from(components.values());
      for (let i = instances.length - 1; i >= 0; i -= 1) {
        const instance = instances[i];
        if (instance) {
          instance.unmount();
        }
      }
      components.clear();
    },
  };

  if (config.id) {
    adapter.id = config.id;
  }

  return adapter;
}

export function createPortableUiFactory<TRegistry extends DeclarativeRegistry>(registry: TRegistry) {
  return <const TChildren>(
    container: HTMLElement,
    config: PortableUiCreateConfig<TChildren>
  ): PortableUiAdapter<InferTopLevelComponentMap<TRegistry, TChildren>> => {
    return CreatePortableUi(container, config, registry);
  };
}

export function registerDeclarativeComponent(type: string, ctor: ComponentCtor): void {
  if (!type || !ctor) {
    throw new Error('registerDeclarativeComponent requires both type and constructor.');
  }

  (builtInComponentRegistry as DeclarativeRegistry)[type] = ctor;
}



