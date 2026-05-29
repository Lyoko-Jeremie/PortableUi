import {BaseComponent} from '../core';
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
import {DeclarativeChildren, DeclarativeComponentNode, PortableUiAdapter, PortableUiDeclarativeConfig} from './types';

type ComponentCtor = new (props?: Record<string, any>) => BaseComponent;

const builtInComponentRegistry: Record<string, ComponentCtor> = {
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
};

function toEntries(children: DeclarativeChildren | undefined): Array<[string, DeclarativeComponentNode]> {
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

function mountNode(
  key: string,
  node: DeclarativeComponentNode,
  parent: HTMLElement,
  components: Map<string, BaseComponent>
): void {
  const ctor = builtInComponentRegistry[node.type];
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
    mountNode(childKey, childNode, element, components);
  }
}

export function CreatePortableUi(container: HTMLElement, config: PortableUiDeclarativeConfig): PortableUiAdapter {
  if (!container) {
    throw new Error('CreatePortableUi requires a valid container element.');
  }

  const components = new Map<string, BaseComponent>();

  if (config.id) {
    container.setAttribute('data-portableui-id', config.id);
  }

  for (const [key, node] of toEntries(config.children)) {
    mountNode(key, node, container, components);
  }

  const adapter: PortableUiAdapter = {
    root: container,
    getComponent<T extends BaseComponent = BaseComponent>(id: string): T | null {
      return (components.get(id) as T | undefined) ?? null;
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

export function registerDeclarativeComponent(type: string, ctor: ComponentCtor): void {
  if (!type || !ctor) {
    throw new Error('registerDeclarativeComponent requires both type and constructor.');
  }

  builtInComponentRegistry[type] = ctor;
}



