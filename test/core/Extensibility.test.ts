import {BaseComponent, defineComponent, extensibilityManager, PortableUiPlugin} from '../../src/core';
import type {ComponentProps} from '../../src/types';

class TestComponent extends BaseComponent {
  protected render(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'test-component';
    element.textContent = 'test';
    return element;
  }
}

describe('Extensibility system', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should create custom component via defineComponent', () => {
    interface BadgeProps extends ComponentProps {
      text?: string;
    }

    const Badge = defineComponent<BadgeProps>({
      defaultProps: {text: 'default'},
      render: (props) => {
        const element = document.createElement('span');
        element.className = 'badge';
        element.textContent = props.text ?? '';
        return element;
      }
    });

    const badge = new Badge({text: 'new'});
    badge.mount(container);

    expect(container.querySelector('.badge')?.textContent).toBe('new');
  });

  it('should support plugin registration for custom components', () => {
    const plugin: PortableUiPlugin = {
      name: 'test-plugin',
      install(api) {
        api.registerComponent('test.card', TestComponent);
      },
      uninstall(api) {
        api.unregisterComponent('test.card');
      }
    };

    extensibilityManager.plugins.use(plugin);

    expect(extensibilityManager.plugins.has('test-plugin')).toBe(true);
    expect(extensibilityManager.components.has('test.card')).toBe(true);

    const component = extensibilityManager.components.create('test.card');
    component.mount(container);

    expect(container.querySelector('.test-component')).not.toBeNull();

    extensibilityManager.plugins.uninstall('test-plugin');
    expect(extensibilityManager.components.has('test.card')).toBe(false);
  });

  it('should execute lifecycle hooks around component mount', () => {
    const calls: string[] = [];
    const disposeBefore = extensibilityManager.hooks.tap('beforeMount', () => calls.push('before'));
    const disposeAfter = extensibilityManager.hooks.tap('afterMount', () => calls.push('after'));

    const component = new TestComponent();
    component.mount(container);

    disposeBefore();
    disposeAfter();

    expect(calls).toEqual(['before', 'after']);
  });

  it('should allow middleware to cancel mount lifecycle', () => {
    const disposeMiddleware = extensibilityManager.middleware.use((context, next) => {
      if (context.phase === 'mount') {
        context.cancel = true;
        return;
      }

      next();
    });

    const component = new TestComponent();
    component.mount(container);

    disposeMiddleware();

    expect(component.isMounted()).toBe(false);
    expect(container.querySelector('.test-component')).toBeNull();
  });
});

