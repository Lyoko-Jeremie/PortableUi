import { Select } from '../../../src/components/basic/Select';

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

describe('Select', () => {
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
    it('should render a <select> element', () => {
      const select = new Select();
      select.mount(container);
      expect(container.querySelector('select')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-select"', () => {
      const select = new Select();
      select.mount(container);
      expect(container.querySelector('select')?.classList.contains('portableui-select')).toBe(true);
    });

    it('should render the correct number of options', () => {
      const select = new Select({ options: OPTIONS });
      select.mount(container);
      expect(container.querySelectorAll('option').length).toBe(OPTIONS.length);
    });

    it('should render option labels and values correctly', () => {
      const select = new Select({ options: OPTIONS });
      select.mount(container);
      const optEls = container.querySelectorAll('option');
      expect(optEls[0]?.textContent).toBe('Apple');
      expect(optEls[0]?.value).toBe('apple');
    });

    it('should mark a disabled option as disabled', () => {
      const select = new Select({ options: OPTIONS });
      select.mount(container);
      const optEls = container.querySelectorAll('option');
      expect(optEls[2]?.disabled).toBe(true);
    });

    it('should pre-select the option matching value', () => {
      const select = new Select({ options: OPTIONS, value: 'banana' });
      select.mount(container);
      expect((container.querySelector('select') as HTMLSelectElement).value).toBe('banana');
    });

    it('should render a placeholder option when placeholder is provided', () => {
      const select = new Select({ options: OPTIONS, placeholder: 'Choose...' });
      select.mount(container);
      const firstOpt = container.querySelector('option');
      expect(firstOpt?.textContent).toBe('Choose...');
      expect(firstOpt?.disabled).toBe(true);
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const select = new Select({ disabled: true });
      select.mount(container);
      expect(container.querySelector('select')?.disabled).toBe(true);
    });

    it('should be required when required=true', () => {
      const select = new Select({ required: true });
      select.mount(container);
      expect(container.querySelector('select')?.required).toBe(true);
    });

    it('should support multiple selection', () => {
      const select = new Select({ multiple: true });
      select.mount(container);
      expect(container.querySelector('select')?.multiple).toBe(true);
    });

    it('should set name attribute', () => {
      const select = new Select({ name: 'fruit' });
      select.mount(container);
      expect(container.querySelector('select')?.name).toBe('fruit');
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onChange when selection changes', () => {
      const onChange = jest.fn();
      const select = new Select({ options: OPTIONS, onChange });
      select.mount(container);
      const el = container.querySelector('select') as HTMLSelectElement;
      el.value = 'banana';
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('getValue', () => {
      it('should return the selected value', () => {
        const select = new Select({ options: OPTIONS, value: 'apple' });
        select.mount(container);
        expect(select.getValue()).toBe('apple');
      });

      it('should return empty string when not mounted', () => {
        const select = new Select();
        expect(select.getValue()).toBe('');
      });
    });

    describe('setValue', () => {
      it('should update the selected option', () => {
        const select = new Select({ options: OPTIONS, value: 'apple' });
        select.mount(container);
        select.setValue('banana');
        expect((container.querySelector('select') as HTMLSelectElement).value).toBe('banana');
      });
    });

    describe('setOptions', () => {
      it('should replace the option list', () => {
        const select = new Select({ options: OPTIONS });
        select.mount(container);
        select.setOptions([{ label: 'New', value: 'new' }]);
        expect(container.querySelectorAll('option').length).toBe(1);
        expect(container.querySelector('option')?.value).toBe('new');
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const select = new Select();
      select.mount(container);
      expect(select.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const select = new Select();
      select.mount(container);
      select.unmount();
      expect(select.isMounted()).toBe(false);
    });
  });
});

