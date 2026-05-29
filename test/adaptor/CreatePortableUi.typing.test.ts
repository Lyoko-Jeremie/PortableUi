import {BaseComponent, createPortableUiFactory, type BuiltInDeclarativeRegistry, type PortableUiDeclarativeConfig} from '../../src';

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
    createUi(host, customConfig);
    expect(host.querySelector('#badge1')?.textContent).toBe('typed');
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


