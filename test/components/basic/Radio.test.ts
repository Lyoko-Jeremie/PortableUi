import { Radio } from '../../../src/components/basic/Radio';

describe('Radio', () => {
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
    it('should render a wrapper <label> element', () => {
      const radio = new Radio();
      radio.mount(container);
      expect(container.querySelector('label')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-radio"', () => {
      const radio = new Radio();
      radio.mount(container);
      expect(container.querySelector('label')?.classList.contains('portableui-radio')).toBe(true);
    });

    it('should render an <input type="radio"> inside the wrapper', () => {
      const radio = new Radio();
      radio.mount(container);
      expect(container.querySelector('input[type="radio"]')).not.toBeNull();
    });

    it('should be unchecked by default', () => {
      const radio = new Radio();
      radio.mount(container);
      expect((container.querySelector('input[type="radio"]') as HTMLInputElement).checked).toBe(false);
    });

    it('should be checked when checked=true', () => {
      const radio = new Radio({ checked: true });
      radio.mount(container);
      expect((container.querySelector('input[type="radio"]') as HTMLInputElement).checked).toBe(true);
    });

    it('should render label text in the <span>', () => {
      const radio = new Radio({ label: 'Option A' });
      radio.mount(container);
      expect(container.querySelector('span')?.textContent).toBe('Option A');
    });

    it('should render with empty label text by default', () => {
      const radio = new Radio();
      radio.mount(container);
      expect(container.querySelector('span')?.textContent).toBe('');
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const radio = new Radio({ disabled: true });
      radio.mount(container);
      expect((container.querySelector('input[type="radio"]') as HTMLInputElement).disabled).toBe(true);
    });

    it('should be required when required=true', () => {
      const radio = new Radio({ required: true });
      radio.mount(container);
      expect((container.querySelector('input[type="radio"]') as HTMLInputElement).required).toBe(true);
    });

    it('should set the name attribute (for grouping)', () => {
      const radio = new Radio({ name: 'my-group' });
      radio.mount(container);
      expect((container.querySelector('input[type="radio"]') as HTMLInputElement).name).toBe('my-group');
    });

    it('should set the value attribute', () => {
      const radio = new Radio({ value: 'optA' });
      radio.mount(container);
      expect((container.querySelector('input[type="radio"]') as HTMLInputElement).value).toBe('optA');
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onChange when the radio is selected', () => {
      const onChange = jest.fn();
      const radio = new Radio({ onChange });
      radio.mount(container);
      const el = container.querySelector('input[type="radio"]') as HTMLInputElement;
      el.checked = true;
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should pass the checked state to onChange', () => {
      const onChange = jest.fn();
      const radio = new Radio({ onChange });
      radio.mount(container);
      const el = container.querySelector('input[type="radio"]') as HTMLInputElement;
      el.checked = true;
      el.dispatchEvent(new Event('change'));
      expect(onChange.mock.calls[0]?.[2]).toBe(true);
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('isChecked', () => {
      it('should return false when unchecked', () => {
        const radio = new Radio();
        radio.mount(container);
        expect(radio.isChecked()).toBe(false);
      });

      it('should return true when checked', () => {
        const radio = new Radio({ checked: true });
        radio.mount(container);
        expect(radio.isChecked()).toBe(true);
      });
    });

    describe('setChecked', () => {
      it('should update the checked state to true', () => {
        const radio = new Radio();
        radio.mount(container);
        radio.setChecked(true);
        expect(radio.isChecked()).toBe(true);
      });

      it('should update the checked state to false', () => {
        const radio = new Radio({ checked: true });
        radio.mount(container);
        radio.setChecked(false);
        expect(radio.isChecked()).toBe(false);
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const radio = new Radio();
      radio.mount(container);
      expect(radio.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const radio = new Radio();
      radio.mount(container);
      radio.unmount();
      expect(radio.isMounted()).toBe(false);
    });
  });
});

