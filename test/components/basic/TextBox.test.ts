import { TextBox } from '../../../src/components/basic/TextBox';

describe('TextBox', () => {
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
    it('should render a <textarea> element', () => {
      const tb = new TextBox();
      tb.mount(container);
      expect(container.querySelector('textarea')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-textbox"', () => {
      const tb = new TextBox();
      tb.mount(container);
      expect(container.querySelector('textarea')?.classList.contains('portableui-textbox')).toBe(true);
    });

    it('should render with empty value by default', () => {
      const tb = new TextBox();
      tb.mount(container);
      expect(container.querySelector('textarea')?.value).toBe('');
    });

    it('should render with provided value', () => {
      const tb = new TextBox({ value: 'hello' });
      tb.mount(container);
      expect(container.querySelector('textarea')?.value).toBe('hello');
    });

    it('should render with provided placeholder', () => {
      const tb = new TextBox({ placeholder: 'Type here...' });
      tb.mount(container);
      expect(container.querySelector('textarea')?.placeholder).toBe('Type here...');
    });

    it('should use default rows=4', () => {
      const tb = new TextBox();
      tb.mount(container);
      expect(container.querySelector('textarea')?.rows).toBe(4);
    });

    it('should use default cols=30', () => {
      const tb = new TextBox();
      tb.mount(container);
      expect(container.querySelector('textarea')?.cols).toBe(30);
    });

    it('should use provided rows and cols', () => {
      const tb = new TextBox({ rows: 8, cols: 60 });
      tb.mount(container);
      const el = container.querySelector('textarea')!;
      expect(el.rows).toBe(8);
      expect(el.cols).toBe(60);
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const tb = new TextBox({ disabled: true });
      tb.mount(container);
      expect(container.querySelector('textarea')?.disabled).toBe(true);
    });

    it('should be readonly when readonly=true', () => {
      const tb = new TextBox({ readonly: true });
      tb.mount(container);
      expect(container.querySelector('textarea')?.readOnly).toBe(true);
    });

    it('should be required when required=true', () => {
      const tb = new TextBox({ required: true });
      tb.mount(container);
      expect(container.querySelector('textarea')?.required).toBe(true);
    });

    it.each(['none', 'both', 'horizontal', 'vertical'] as const)(
      'should set resize="%s"',
      (resize) => {
        const tb = new TextBox({ resize });
        tb.mount(container);
        expect(container.querySelector('textarea')?.style.resize).toBe(resize);
      }
    );
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onInput when the user types', () => {
      const onInput = jest.fn();
      const tb = new TextBox({ onInput });
      tb.mount(container);
      const el = container.querySelector('textarea')!;
      el.value = 'abc';
      el.dispatchEvent(new Event('input'));
      expect(onInput).toHaveBeenCalledTimes(1);
    });

    it('should pass current value to onInput', () => {
      const onInput = jest.fn();
      const tb = new TextBox({ onInput });
      tb.mount(container);
      const el = container.querySelector('textarea')!;
      el.value = 'hello';
      el.dispatchEvent(new Event('input'));
      expect(onInput.mock.calls[0]?.[2]).toBe('hello');
    });

    it('should call onChange when value commits', () => {
      const onChange = jest.fn();
      const tb = new TextBox({ onChange });
      tb.mount(container);
      const el = container.querySelector('textarea')!;
      el.value = 'done';
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('getValue', () => {
      it('should return the current value', () => {
        const tb = new TextBox({ value: 'test' });
        tb.mount(container);
        expect(tb.getValue()).toBe('test');
      });

      it('should return empty string when not mounted', () => {
        const tb = new TextBox();
        expect(tb.getValue()).toBe('');
      });
    });

    describe('setValue', () => {
      it('should update the displayed value', () => {
        const tb = new TextBox({ value: 'old' });
        tb.mount(container);
        tb.setValue('new');
        expect(container.querySelector('textarea')?.value).toBe('new');
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const tb = new TextBox();
      tb.mount(container);
      expect(tb.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const tb = new TextBox();
      tb.mount(container);
      tb.unmount();
      expect(tb.isMounted()).toBe(false);
    });
  });
});

