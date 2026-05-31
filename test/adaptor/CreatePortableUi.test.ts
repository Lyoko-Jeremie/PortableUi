import {signal} from 'alien-signals';

import {CreatePortableUi, createPortableUiFactory, type BindingContext, type PortableUiDeclarativeConfig} from '../../src/adaptor';
import {BaseComponent, Button, Container, Input} from '../../src';

describe('CreatePortableUi', () => {
  let host: HTMLElement;

  const flushBindings = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
  };

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
    // Components live inside the shadow root; query via ui.root (the mount node inside shadow)
    expect(ui.root.querySelector('#button1')?.textContent).toBe('Click Me');
    expect(ui.root.querySelector('#input1')?.getAttribute('placeholder')).toBe('Type here');
    expect(ui.getComponent('button1')).toBeInstanceOf(Button);
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

    const panel = ui.getComponent('panel');
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

    // After destroy, elements are removed from the shadow mount root
    expect(ui.root.querySelector('#first')).toBeNull();
    expect(ui.root.querySelector('#second')).toBeNull();
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

    const ui = createUi(host, config);

    expect(ui.root.querySelector('#badge1')?.textContent).toBe('typed custom');
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

  it('supports path-based two-way binding and callback context', async () => {
    const model = {
      form: {
        name: 'Alice',
      },
    };

    const ui = CreatePortableUi(host, {
      model,
      children: {
        nameInput: {
          type: 'Input',
          props: {
            id: 'nameInput',
            bind: {
              value: 'form.name',
            },
          },
        },
        saveButton: {
          type: 'Button',
          props: {
            id: 'saveButton',
            text: 'Save',
            bind: {
              onClick: (ctx: BindingContext) => {
                ctx.set('form.name', 'Carol');
              },
            },
          },
        },
      },
    });

    const input = ui.getComponent('nameInput') as Input | null;
    const button = ui.getComponent('saveButton') as Button | null;
    expect(input?.getValue()).toBe('Alice');
    expect(ui.boundModel).toBe(model);

    const inputElement = input?.getElement() as HTMLInputElement | null;
    expect(inputElement).toBeTruthy();
    if (!input || !inputElement || !button?.getElement()) {
      throw new Error('Expected input and button to be mounted.');
    }

    inputElement.value = 'Bob';
    inputElement.dispatchEvent(new Event('input', {bubbles: true}));

    expect(model.form.name).toBe('Bob');

    button.getElement()?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await flushBindings();

    expect(model.form.name).toBe('Carol');
    expect(input.getValue()).toBe('Carol');

    model.form.name = 'Dana';
    ui.markDirty('form.name');
    await flushBindings();

    expect(input.getValue()).toBe('Dana');
  });

  it('supports alien-signals bindings and global binding override warnings', async () => {
    const nameSignal = signal('Signal Alice');
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const ui = CreatePortableUi(host, {
      model: {
        form: {
          local: 'Local',
        },
      },
      bindings: {
        signalInput: {
          value: nameSignal,
        },
        overrideInput: {
          value: 'form.global',
        },
      },
      children: {
        signalInput: {
          type: 'Input',
          props: {
            id: 'signalInput',
          },
        },
        overrideInput: {
          type: 'Input',
          props: {
            id: 'overrideInput',
            bind: {
              value: 'form.local',
            },
          },
        },
      },
    });

    const signalInput = ui.getComponent('signalInput') as Input | null;
    const overrideInput = ui.getComponent('overrideInput') as Input | null;

    const model = ui.getModel<{form: {global: string; local: string}}>();
    model.form.global = 'Global';
    ui.markDirty('form.global');
    await flushBindings();

    expect(signalInput?.getValue()).toBe('Signal Alice');
    expect(overrideInput?.getValue()).toBe('Global');
    expect(warnSpy).toHaveBeenCalledWith(
      '[PortableUi Binding Warn][BINDING_CONFLICT]',
      expect.objectContaining({componentId: 'overrideInput', field: 'value'})
    );

    nameSignal('Signal Bob');
    await flushBindings();
    expect(signalInput?.getValue()).toBe('Signal Bob');

    const signalElement = signalInput?.getElement() as HTMLInputElement | null;
    if (!signalElement) {
      throw new Error('Expected signal input element.');
    }

    signalElement.value = 'Signal Carol';
    signalElement.dispatchEvent(new Event('input', {bubbles: true}));
    expect(nameSignal()).toBe('Signal Carol');

    warnSpy.mockRestore();
  });
});

