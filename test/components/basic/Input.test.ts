import { Input } from '../../../src/components/basic/Input';

describe('Input', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ── 渲染与默认值 ────────────────────────────────────────────────

  describe('rendering', () => {
    it('should render an <input> element', () => {
      const input = new Input();
      input.mount(container);
      expect(container.querySelector('input')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-input"', () => {
      const input = new Input();
      input.mount(container);
      expect(container.querySelector('input')?.classList.contains('portableui-input')).toBe(true);
    });

    it('should default to type "text"', () => {
      const input = new Input();
      input.mount(container);
      expect(container.querySelector('input')?.type).toBe('text');
    });

    it('should render with an empty value by default', () => {
      const input = new Input();
      input.mount(container);
      expect(container.querySelector('input')?.value).toBe('');
    });

    it('should render with provided value', () => {
      const input = new Input({ value: 'hello' });
      input.mount(container);
      expect(container.querySelector('input')?.value).toBe('hello');
    });

    it('should render with provided placeholder', () => {
      const input = new Input({ placeholder: 'Enter text...' });
      input.mount(container);
      expect(container.querySelector('input')?.placeholder).toBe('Enter text...');
    });

    it('should apply a custom id', () => {
      const input = new Input({ id: 'my-input' });
      input.mount(container);
      expect(container.querySelector('input')?.id).toBe('my-input');
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it.each(['text', 'password', 'email', 'number', 'search', 'tel', 'url'] as const)(
      'should set type="%s"',
      (type) => {
        const input = new Input({ type });
        input.mount(container);
        expect(container.querySelector('input')?.type).toBe(type);
      }
    );

    it('should be disabled when disabled=true', () => {
      const input = new Input({ disabled: true });
      input.mount(container);
      expect(container.querySelector('input')?.disabled).toBe(true);
    });

    it('should be readonly when readonly=true', () => {
      const input = new Input({ readonly: true });
      input.mount(container);
      expect(container.querySelector('input')?.readOnly).toBe(true);
    });

    it('should be required when required=true', () => {
      const input = new Input({ required: true });
      input.mount(container);
      expect(container.querySelector('input')?.required).toBe(true);
    });

    it('should set name attribute', () => {
      const input = new Input({ name: 'username' });
      input.mount(container);
      expect(container.querySelector('input')?.name).toBe('username');
    });

    it('should set autocomplete attribute', () => {
      const input = new Input({ autocomplete: 'email' });
      input.mount(container);
      expect(container.querySelector('input')?.getAttribute('autocomplete')).toBe('email');
    });

    it('should set minLength', () => {
      const input = new Input({ minLength: 3 });
      input.mount(container);
      expect(container.querySelector('input')?.minLength).toBe(3);
    });

    it('should set maxLength', () => {
      const input = new Input({ maxLength: 20 });
      input.mount(container);
      expect(container.querySelector('input')?.maxLength).toBe(20);
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onInput when the user types', () => {
      const onInput = jest.fn();
      const input = new Input({ onInput });
      input.mount(container);
      const el = container.querySelector('input')!;
      el.value = 'abc';
      el.dispatchEvent(new Event('input'));
      expect(onInput).toHaveBeenCalledTimes(1);
    });

    it('should pass current value to onInput callback', () => {
      const onInput = jest.fn();
      const input = new Input({ onInput });
      input.mount(container);
      const el = container.querySelector('input')!;
      el.value = 'hello';
      el.dispatchEvent(new Event('input'));
      expect(onInput.mock.calls[0]?.[2]).toBe('hello');
    });

    it('should call onChange when value changes', () => {
      const onChange = jest.fn();
      const input = new Input({ onChange });
      input.mount(container);
      const el = container.querySelector('input')!;
      el.value = 'changed';
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should pass current value to onChange callback', () => {
      const onChange = jest.fn();
      const input = new Input({ onChange });
      input.mount(container);
      const el = container.querySelector('input')!;
      el.value = 'changed';
      el.dispatchEvent(new Event('change'));
      expect(onChange.mock.calls[0]?.[2]).toBe('changed');
    });

    it('should keep focus and caret during controlled typing rerenders', () => {
      const inputComponent = new Input({
        onInput: (self, _event, value) => {
          self.setValue(value);
        },
      });

      inputComponent.mount(container);

      let input = container.querySelector('input') as HTMLInputElement;
      input.focus();

      for (const text of ['a', 'ab', 'abc']) {
        input.value = text;
        input.setSelectionRange(text.length, text.length);
        input.dispatchEvent(new Event('input', {bubbles: true}));

        input = container.querySelector('input') as HTMLInputElement;
        expect(document.activeElement).toBe(input);
        expect(input.selectionStart).toBe(text.length);
        expect(input.selectionEnd).toBe(text.length);
        expect(input.value).toBe(text);
      }
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('getValue', () => {
      it('should return the current input value', () => {
        const input = new Input({ value: 'test' });
        input.mount(container);
        expect(input.getValue()).toBe('test');
      });

      it('should return empty string when not mounted', () => {
        const input = new Input();
        expect(input.getValue()).toBe('');
      });
    });

    describe('setValue', () => {
      it('should update the displayed value', () => {
        const input = new Input({ value: 'old' });
        input.mount(container);
        input.setValue('new');
        expect(container.querySelector('input')?.value).toBe('new');
      });
    });

    describe('focus / blur', () => {
      it('should not throw when focus() is called on a mounted input', () => {
        const input = new Input();
        input.mount(container);
        expect(() => input.focus()).not.toThrow();
      });

      it('should not throw when blur() is called on a mounted input', () => {
        const input = new Input();
        input.mount(container);
        expect(() => input.blur()).not.toThrow();
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const input = new Input();
      input.mount(container);
      expect(input.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const input = new Input();
      input.mount(container);
      input.unmount();
      expect(input.isMounted()).toBe(false);
    });
  });
});

