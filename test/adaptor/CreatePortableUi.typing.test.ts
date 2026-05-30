import {
  BaseComponent,
  Button,
  CreatePortableUi,
  Input,
  createPortableUiFactory,
  type BuiltInDeclarativeRegistry,
  type PortableUiDeclarativeConfig,
} from '../../src';

describe('CreatePortableUi typing', () => {
  it('keeps declarative config strongly typed at compile time', () => {
    const validConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
      children: {
        okButton: {
          type: 'Button',
          props: {
            text: 'OK',
            // Button supports label alias in declarative config typing.
            label: 'OK',
          },
        },
      },
    };

    expect(validConfig.children).toBeDefined();
  });

  it('enforces custom registry keys at compile time', () => {
    class Badge extends BaseComponent {
      protected render(): HTMLElement {
        const el = document.createElement('span');
        el.textContent = String(this.getProps().text ?? '');
        return el;
      }
    }

    const registry = {Badge};
    const createUi = createPortableUiFactory(registry);

    const customConfig: PortableUiDeclarativeConfig<typeof registry> = {
      children: {
        badge1: {
          type: 'Badge',
          props: {text: 'typed'},
        },
      },
    };

    const host = document.createElement('div');
    const ui = createUi(host, customConfig);
    expect(ui.root.querySelector('#badge1')?.textContent).toBe('typed');
  });

  it('infers instance type from getComponent(id) by config id', () => {
    const host = document.createElement('div');
    const config = {
      children: {
        button1: {
          type: 'Button',
          props: {text: 'Save'},
        },
        field: {
          type: 'Input',
          props: {id: 'emailField', placeholder: 'email'},
        },
      },
    } as const satisfies PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry>;

    const ui = CreatePortableUi(host, config);

    const button = ui.getComponent('button1');
    const inputByKey = ui.getComponent('field');

    const buttonTyped: Button | null = button;
    const inputTyped: Input | null = inputByKey;
    void buttonTyped;
    void inputTyped;

    // @ts-expect-error top-level key "field" resolves to Input, not Button.
    const wrongByKey: Button | null = ui.getComponent('field');
    void wrongByKey;

    // @ts-expect-error "button1" resolves to Button, not Input.
    const wrongByType: Input | null = ui.getComponent('button1');
    void wrongByType;
  });
});

const validBuiltInConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    input1: {
      type: 'Input',
      props: {
        placeholder: 'ok',
        disabled: true,
      },
    },
  },
};

void validBuiltInConfig;

const invalidTypeConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    x: {
      // @ts-expect-error unknown built-in type should be rejected by typing.
      type: 'UnknownComponent',
    },
  },
};

void invalidTypeConfig;

const invalidPropsConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    // @ts-expect-error known property type mismatch should be rejected.
    btn: {
      type: 'Button',
      props: {
        text: 123,
      },
    },
  },
};

void invalidPropsConfig;

