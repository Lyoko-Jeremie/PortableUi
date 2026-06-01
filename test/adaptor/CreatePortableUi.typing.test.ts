import {computed, signal} from 'alien-signals';

import {
  App,
  BaseComponent,
  Button,
  CreatePortableUi,
  Input,
  type PathBinding,
  type PortableUiBindingMap,
  createPortableUiFactory,
  type BuiltInDeclarativeRegistry,
  type BindingContext,
  type PortableUiDeclarativeConfig,
} from '../../src';

describe('CreatePortableUi typing', () => {
  it('infers bind dot-paths from model structure', () => {
    const model = {
      form: {
        profile: {
          name: 'Alice',
        },
      },
      actions: {
        save: (_ctx: BindingContext) => {
        },
      },
    };

    const validConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry, typeof model> = {
      model,
      children: {
        nameInput: {
          type: 'Input',
          bind: {
            value: 'form.profile.name',
          },
        },
        saveBtn: {
          type: 'Button',
          props: {
            text: 'Save',
          },
          bind: {
            onClick: 'actions.save',
          },
        },
      },
    };

    expect(validConfig.children).toBeDefined();
  });

  it('rejects unknown bind paths against model', () => {
    const model = {
      form: {
        profile: {
          name: 'Alice',
        },
      },
      actions: {
        save: (_ctx: BindingContext) => {
        },
      },
    };

    const invalidConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry, typeof model> = {
      model,
      children: {
        nameInput: {
          type: 'Input',
          bind: {
            // @ts-expect-error "form.profile.nickname" does not exist in model paths.
            value: 'form.profile.nickname',
          },
        },
        saveBtn: {
          type: 'Button',
          props: {
            text: 'Save',
          },
          bind: {
            // @ts-expect-error callback path must resolve to a function field.
            onClick: 'actions.unknown',
          },
        },
      },
    };

    type ModelPaths = PathBinding<typeof model>;
    const validPath: ModelPaths = 'form.profile.name';
    void validPath;
    // @ts-expect-error invalid path should be rejected by dot-path type.
    const invalidPath: ModelPaths = 'form.profile.nickname';
    void invalidPath;

    expect(invalidConfig.children).toBeDefined();
  });

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
    interface BadgeProps {
      id?: string;
      text?: string;
    }

    class Badge extends BaseComponent<any, BadgeProps> {
      constructor(props: BadgeProps = {}) {
        super(props);
      }

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

  it('accepts alien-signals writable signal and accessor bindings', () => {
    const nameSignal = signal('Alice');
    const accessorSignal = signal('Bob');

    const config: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
      children: {
        signalInput: {
          type: 'Input',
          bind: {
            value: nameSignal,
          },
        },
        accessorInput: {
          type: 'Input',
          bind: {
            value: accessorSignal,
          },
        },
        boundButton: {
          type: 'Button',
          props: {
            text: 'Save',
          },
        },
        label: {
          type: 'Label',
          bind: {
            text: 'form.name',
          },
        },
      },
    };

    expect(config.children).toBeDefined();
  });

  it('supports imperative add.* binding typings', () => {
    const host = document.createElement('div');
    const app = new App(host, {id: 'root'});
    const draftSignal = signal('draft');

    const input: Input = app.add.Input({
      id: 'draftInput',
      bind: {
        value: draftSignal,
      },
    });

    void input;
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
    btn: {
      type: 'Button',
      props: {
        // @ts-expect-error known property type mismatch should be rejected.
        text: 123,
      },
    },
  },
};

void invalidPropsConfig;

const stateForBindingSamples = {name: 'sample'};
const writableNameSignal = signal('sample');
const readonlyNameSignal = computed(() => stateForBindingSamples.name);

const validSignalBindingConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    input1: {
      type: 'Input',
      bind: {
        value: writableNameSignal,
      },
    },
  },
};

void validSignalBindingConfig;

const validAccessorBindingConfig: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    input1: {
      type: 'Input',
      bind: {
        value: writableNameSignal,
      },
    },
  },
};

void validAccessorBindingConfig;

interface StrictInputBindingProps {
  value?: string;
  onChange?: (self: Input, event: Event, value: string) => void;
}

const validInputBindingMap: PortableUiBindingMap<StrictInputBindingProps> = {
  value: writableNameSignal,
  onChange: (ctx: BindingContext) => {
    ctx.markDirty('form.name');
  },
};

void validInputBindingMap;

const invalidReadonlyAccessorBindingMap: PortableUiBindingMap<StrictInputBindingProps> = {
  // @ts-expect-error writable field "value" requires a writable accessor.
  value: {
    get: () => stateForBindingSamples.name,
  },
};

void invalidReadonlyAccessorBindingMap;

const invalidReadonlySignalBindingMap: PortableUiBindingMap<StrictInputBindingProps> = {
  // Computed signals are read-only at runtime; compile-time cannot fully distinguish writable overloads.
  value: readonlyNameSignal,
};

void invalidReadonlySignalBindingMap;

interface StrictLabelBindingProps {
  text?: string;
}

const validLabelBindingMap: PortableUiBindingMap<StrictLabelBindingProps> = {
  text: 'form.labelText',
};

void validLabelBindingMap;

