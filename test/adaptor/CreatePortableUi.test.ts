import {CreatePortableUi, createPortableUiFactory, type PortableUiDeclarativeConfig} from '../../src/adaptor';
import {BaseComponent, Button, Container} from '../../src';

describe('CreatePortableUi', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    document.body.removeChild(host);
  });

  it('creates and mounts components from object children', () => {
    const ui = CreatePortableUi(host, {
      id: 'my-ui',
      children: {
        button1: {
          type: 'Button',
          props: {
            label: 'Click Me',
          },
        },
        input1: {
          type: 'Input',
          props: {
            placeholder: 'Type here',
          },
        },
      },
    });

    expect(host.getAttribute('data-portableui-id')).toBe('my-ui');
    expect(host.querySelector('#button1')?.textContent).toBe('Click Me');
    expect(host.querySelector('#input1')?.getAttribute('placeholder')).toBe('Type here');
    expect(ui.getComponent<Button>('button1')).toBeInstanceOf(Button);
  });

  it('mounts nested children into parent component element', () => {
    const ui = CreatePortableUi(host, {
      children: {
        panel: {
          type: 'Container',
          props: {className: 'panel'},
          children: {
            action: {
              type: 'Button',
              props: {text: 'Run'},
            },
          },
        },
      },
    });

    const panel = ui.getComponent<Container>('panel');
    expect(panel).toBeInstanceOf(Container);
    expect(panel?.getElement()?.querySelector('#action')?.textContent).toBe('Run');
  });

  it('supports array children and provides cleanup via destroy()', () => {
    const ui = CreatePortableUi(host, {
      children: [
        {type: 'Button', props: {id: 'first', text: 'A'}},
        {type: 'Button', props: {id: 'second', text: 'B'}},
      ],
    });

    expect(ui.getAllComponents()).toHaveLength(2);

    ui.destroy();

    expect(host.querySelector('#first')).toBeNull();
    expect(host.querySelector('#second')).toBeNull();
    expect(ui.getAllComponents()).toHaveLength(0);
  });

  it('throws for unknown component types', () => {
    expect(() => {
      CreatePortableUi(host, {
        children: {
          x: {
            type: 'UnknownComponent',
          },
        },
      } as any);
    }).toThrow('Unknown component type: UnknownComponent');
  });

  it('supports a custom typed registry through createPortableUiFactory', () => {
    class Badge extends BaseComponent {
      protected render(): HTMLElement {
        const el = document.createElement('span');
        el.textContent = String(this.getProps().text ?? '');
        return el;
      }
    }

    const registry = {Badge};
    const createUi = createPortableUiFactory(registry);

    const config: PortableUiDeclarativeConfig<typeof registry> = {
      children: {
        badge1: {
          type: 'Badge',
          props: {text: 'typed custom'},
        },
      },
    };

    createUi(host, config);

    expect(host.querySelector('#badge1')?.textContent).toBe('typed custom');
  });

  it('throws when duplicate component ids are declared', () => {
    expect(() => {
      CreatePortableUi(host, {
        children: {
          first: {
            type: 'Button',
            props: {id: 'same-id', text: 'A'},
          },
          second: {
            type: 'Button',
            props: {id: 'same-id', text: 'B'},
          },
        },
      });
    }).toThrow('Duplicate component id: same-id');
  });
});

