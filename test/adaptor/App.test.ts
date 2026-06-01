import {computed, signal} from 'alien-signals';

import type {BindingContext} from '../../src';
import {App, Button, Input} from '../../src';

/** Query inside PortableUi's Shadow DOM on a host element */
function shadowQ(host: HTMLElement, selector: string): Element | null {
  return (host.shadowRoot ?? host).querySelector(selector);
}

describe('App imperative adaptor', () => {
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

  it('creates a root scope and mounts basic components', () => {
    const app = new App(host, {id: 'root'});

    const button = app.add.Button({id: 'btn1', text: 'Click Me'});
    const input = app.add.Input({id: 'input1', placeholder: 'Type here'});
    const label = app.add.Label({id: 'label1', text: 'Hello'});

    expect(button).toBeInstanceOf(Button);
    expect(input).toBeInstanceOf(Input);
    expect(label).toBeTruthy();
    expect(shadowQ(host, '#root')).toBeTruthy();
    expect(shadowQ(host, '#btn1')?.textContent).toBe('Click Me');
    expect(shadowQ(host, '#input1')?.getAttribute('placeholder')).toBe('Type here');
    expect(shadowQ(host, '#label1')?.textContent).toBe('Hello');
    expect(app.getComponent('btn1')).toBe(button);
  });

  it('supports nested tab scopes', () => {
    const app = new App(host, {id: 'root'});

    const tab = app.add.tab({id: 'tab1'});
    tab.add.Button({id: 'tabBtn1', text: 'Tab Button'});
    tab.add.Input({id: 'tabInput1', placeholder: 'Tab input'});

    const tabElement = shadowQ(host, '#tab1');
    expect(tabElement).toBeTruthy();
    expect(tabElement?.querySelector('#tabBtn1')?.textContent).toBe('Tab Button');
    expect(tabElement?.querySelector('#tabInput1')?.getAttribute('placeholder')).toBe('Tab input');
  });

  it('throws on duplicate ids', () => {
    const app = new App(host, {id: 'root'});
    app.add.Button({id: 'same-id', text: 'A'});

    expect(() => app.add.Input({id: 'same-id'})).toThrow('Duplicate component id: same-id');
  });

  it('destroys all mounted components in reverse order', () => {
    const app = new App(host, {id: 'root'});

    app.add.Button({id: 'btn1', text: 'A'});
    const tab = app.add.tab({id: 'tab1'});
    tab.add.Input({id: 'tabInput'});

    expect(app.getAllComponents().length).toBeGreaterThan(1);

    app.destroy();

    expect(shadowQ(host, '#root')).toBeNull();
    expect(shadowQ(host, '#btn1')).toBeNull();
    expect(shadowQ(host, '#tab1')).toBeNull();
    expect(app.getAllComponents()).toHaveLength(0);
  });

  it('supports imperative path bindings and callback context helpers', async () => {
    const app = new App(host, {
      id: 'root',
      model: {
        form: {
          email: 'alice@example.com',
        },
      },
    });

    const input = app.add.Input({
      id: 'email',
      bind: {
        value: 'form.email',
      },
    });

    const button = app.add.Button({
      id: 'apply-email',
      text: 'Apply',
      bind: {
        onClick: (ctx: BindingContext) => {
          ctx.set('form.email', 'carol@example.com');
        },
      },
    });

    expect(input.getValue()).toBe('alice@example.com');

    const inputElement = input.getElement() as HTMLInputElement | null;
    const buttonElement = button.getElement();
    if (!inputElement || !buttonElement) {
      throw new Error('Expected imperative components to mount.');
    }

    inputElement.focus();
    inputElement.value = 'bob@example.com';
    inputElement.dispatchEvent(new Event('input', {bubbles: true}));
    expect(app.getModel<{form: {email: string}}>().form.email).toBe('bob@example.com');

    await flushBindings();
    expect(input.getElement()).toBe(inputElement);
    expect((host.shadowRoot ?? document).activeElement).toBe(inputElement);

    buttonElement.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    await flushBindings();
    expect(input.getValue()).toBe('carol@example.com');

    const model = app.getModel<{form: {email: string}}>();
    model.form.email = 'dana@example.com';
    app.markDirty('form.email');
    await flushBindings();
    expect(input.getValue()).toBe('dana@example.com');
    expect(app.boundModel).toBe(model);
  });

  it('supports signal and accessor bindings in imperative mode', async () => {
    const nameSignal = signal('Alpha');
    const store = {draft: 'Beta'};

    const app = new App(host, {id: 'root'});
    const signalInput = app.add.Input({
      id: 'signal-input',
      bind: {
        value: nameSignal,
      },
    });
    const accessorInput = app.add.Input({
      id: 'accessor-input',
      bind: {
        value: {
          get: () => store.draft,
          set: (value: string | undefined) => {
            store.draft = value ?? '';
          },
        },
      },
    });

    expect(signalInput.getValue()).toBe('Alpha');
    expect(accessorInput.getValue()).toBe('Beta');

    nameSignal('Gamma');
    app.markDirty();
    await flushBindings();
    expect(signalInput.getValue()).toBe('Gamma');

    const accessorElement = accessorInput.getElement() as HTMLInputElement | null;
    if (!accessorElement) {
      throw new Error('Expected accessor input element.');
    }

    accessorElement.value = 'Delta';
    accessorElement.dispatchEvent(new Event('input', {bubbles: true}));
    expect(store.draft).toBe('Delta');

    store.draft = 'Omega';
    accessorInput.markDirty('value');
    await flushBindings();
    expect(accessorInput.getValue()).toBe('Omega');

    store.draft = 'Sigma';
    app.markDirty(accessorInput, 'value');
    await flushBindings();
    expect(accessorInput.getValue()).toBe('Sigma');
  });

  it('supports bind in nested Container.add calls', async () => {
    const app = new App(host, {
      id: 'root',
      model: {
        profile: {
          name: 'Alice',
        },
      },
    });

    const section = app.add.Container({id: 'section'});
    const nestedInput = section.add.Input({
      id: 'nested-name',
      bind: {
        value: 'profile.name',
      },
    });

    expect(nestedInput.getValue()).toBe('Alice');

    const model = app.getModel<{profile: {name: string}}>();
    model.profile.name = 'Bob';
    app.markDirty('profile.name');
    await flushBindings();
    expect(nestedInput.getValue()).toBe('Bob');

    const inputElement = nestedInput.getElement() as HTMLInputElement | null;
    if (!inputElement) {
      throw new Error('Expected nested input element.');
    }

    inputElement.value = 'Carol';
    inputElement.dispatchEvent(new Event('input', {bubbles: true}));
    expect(model.profile.name).toBe('Carol');
  });

  it('tracks deep path writes and deletes automatically when proxy=true', async () => {
    const app = new App<{form: {contact: {city?: string}}}>(host, {
      id: 'root',
      model: {
        form: {
          contact: {
            city: 'Nanjing',
          },
        },
      },
      bindingOptions: {
        proxy: true,
      },
    });

    const cityInput = app.add.Input({
      id: 'city-input',
      bind: {
        value: 'form.contact.city',
      },
    });

    expect(cityInput.getValue()).toBe('Nanjing');

    const model = app.getModel();
    model.form.contact.city = 'Suzhou';
    await flushBindings();
    expect(cityInput.getValue()).toBe('Suzhou');

    delete model.form.contact.city;
    await flushBindings();
    expect(cityInput.getValue()).toBe('');
  });

  it.each(['binding', 'tree', 'hybrid'] as const)(
    'keeps static text fallback for Label/Checkbox when bind source is initially undefined (%s)',
    async (mode) => {
      type FallbackModel = {
        form: {
          title?: string;
          checkboxLabel?: string;
          checked?: boolean;
        };
      };

      const app = new App<FallbackModel>(host, {
        id: 'root',
        model: {
          form: {},
        },
        bindingOptions: {
          changeDetection: mode,
        },
      });

      const title = app.add.Label({
        id: `fallback-label-${mode}`,
        text: 'Loading title...',
        bind: {
          text: 'form.title',
        },
      });

      const agree = app.add.Checkbox({
        id: `fallback-checkbox-${mode}`,
        label: 'Loading option...',
        bind: {
          label: 'form.checkboxLabel',
          checked: 'form.checked',
        },
      });

      expect(title.getElement()?.textContent).toBe('Loading title...');
      expect(agree.getElement()?.querySelector('span')?.textContent).toBe('Loading option...');

      const model = app.getModel();
      model.form.title = 'Ready title';
      model.form.checkboxLabel = 'Ready option';
      model.form.checked = true;
      app.markDirty('form.title');
      app.markDirty('form.checkboxLabel');
      app.markDirty('form.checked');
      await flushBindings();

      expect(title.getElement()?.textContent).toBe('Ready title');
      expect(agree.getElement()?.querySelector('span')?.textContent).toBe('Ready option');
      expect(agree.isChecked()).toBe(true);
    }
  );

  it.each(['binding', 'tree', 'hybrid'] as const)(
    'reads callable computed bindings for Label/Checkbox immediately (%s)',
    async (mode) => {
      const titleState = signal('Initial title');
      const checkboxLabelState = signal('Initial checkbox');

      const titleComputed = computed(() => titleState());
      const labelComputed = computed(() => checkboxLabelState());

      const app = new App(host, {
        id: 'root-callable',
        model: {
          form: {
            checked: false,
          },
        },
        bindingOptions: {
          changeDetection: mode,
        },
      });

      const title = app.add.Label({
        id: `callable-label-${mode}`,
        bind: {
          text: titleComputed,
        },
      });

      const checkbox = app.add.Checkbox({
        id: `callable-checkbox-${mode}`,
        bind: {
          label: labelComputed,
          checked: 'form.checked',
        },
      });

      expect(title.getElement()?.textContent).toBe('Initial title');
      expect(checkbox.getElement()?.querySelector('span')?.textContent).toBe('Initial checkbox');

      titleState('Updated title');
      checkboxLabelState('Updated checkbox');
      const model = app.getModel<{form: {checked: boolean}}>();
      model.form.checked = true;
      app.markDirty('form.checked');
      await flushBindings();

      expect(title.getElement()?.textContent).toBe('Updated title');
      expect(checkbox.getElement()?.querySelector('span')?.textContent).toBe('Updated checkbox');
      expect(checkbox.isChecked()).toBe(true);
    }
  );

});

