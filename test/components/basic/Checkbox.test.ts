import { Checkbox } from '../../../src/components/basic/Checkbox';

describe('Checkbox', () => {
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
      const cb = new Checkbox();
      cb.mount(container);
      expect(container.querySelector('label')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-checkbox"', () => {
      const cb = new Checkbox();
      cb.mount(container);
      expect(container.querySelector('label')?.classList.contains('portableui-checkbox')).toBe(true);
    });

    it('should render an <input type="checkbox"> inside the wrapper', () => {
      const cb = new Checkbox();
      cb.mount(container);
      expect(container.querySelector('input[type="checkbox"]')).not.toBeNull();
    });

    it('should be unchecked by default', () => {
      const cb = new Checkbox();
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(false);
    });

    it('should be checked when checked=true', () => {
      const cb = new Checkbox({ checked: true });
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(true);
    });

    it('should render label text in the <span>', () => {
      const cb = new Checkbox({ label: 'Accept Terms' });
      cb.mount(container);
      expect(container.querySelector('span')?.textContent).toBe('Accept Terms');
    });

    it('should render with empty label text by default', () => {
      const cb = new Checkbox();
      cb.mount(container);
      expect(container.querySelector('span')?.textContent).toBe('');
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const cb = new Checkbox({ disabled: true });
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).disabled).toBe(true);
    });

    it('should be required when required=true', () => {
      const cb = new Checkbox({ required: true });
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).required).toBe(true);
    });

    it('should be indeterminate when indeterminate=true', () => {
      const cb = new Checkbox({ indeterminate: true });
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).indeterminate).toBe(true);
    });

    it('should set name attribute', () => {
      const cb = new Checkbox({ name: 'agree' });
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).name).toBe('agree');
    });

    it('should set value attribute', () => {
      const cb = new Checkbox({ value: 'yes' });
      cb.mount(container);
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).value).toBe('yes');
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onChange when checked state changes', () => {
      const onChange = jest.fn();
      const cb = new Checkbox({ onChange });
      cb.mount(container);
      const el = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      el.checked = true;
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should pass the new checked state to onChange', () => {
      const onChange = jest.fn();
      const cb = new Checkbox({ onChange });
      cb.mount(container);
      const el = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      el.checked = true;
      el.dispatchEvent(new Event('change'));
      expect(onChange.mock.calls[0]?.[2]).toBe(true);
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('isChecked', () => {
      it('should return false when unchecked', () => {
        const cb = new Checkbox();
        cb.mount(container);
        expect(cb.isChecked()).toBe(false);
      });

      it('should return true when checked', () => {
        const cb = new Checkbox({ checked: true });
        cb.mount(container);
        expect(cb.isChecked()).toBe(true);
      });
    });

    describe('setChecked', () => {
      it('should update the checked state to true', () => {
        const cb = new Checkbox();
        cb.mount(container);
        cb.setChecked(true);
        expect(cb.isChecked()).toBe(true);
      });

      it('should update the checked state to false', () => {
        const cb = new Checkbox({ checked: true });
        cb.mount(container);
        cb.setChecked(false);
        expect(cb.isChecked()).toBe(false);
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const cb = new Checkbox();
      cb.mount(container);
      expect(cb.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const cb = new Checkbox();
      cb.mount(container);
      cb.unmount();
      expect(cb.isMounted()).toBe(false);
    });
  });
});

