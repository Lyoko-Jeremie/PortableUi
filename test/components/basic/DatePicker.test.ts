import { DatePicker } from '../../../src/components/basic/DatePicker';

describe('DatePicker', () => {
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
    it('should render an <input type="date"> element', () => {
      const dp = new DatePicker();
      dp.mount(container);
      expect(container.querySelector('input[type="date"]')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-date-picker"', () => {
      const dp = new DatePicker();
      dp.mount(container);
      expect(container.querySelector('input')?.classList.contains('portableui-date-picker')).toBe(true);
    });

    it('should render with empty value by default', () => {
      const dp = new DatePicker();
      dp.mount(container);
      expect(container.querySelector('input')?.value).toBe('');
    });

    it('should render with provided value', () => {
      const dp = new DatePicker({ value: '2024-01-15' });
      dp.mount(container);
      expect(container.querySelector('input')?.value).toBe('2024-01-15');
    });

    it('should apply a custom id', () => {
      const dp = new DatePicker({ id: 'date-field' });
      dp.mount(container);
      expect(container.querySelector('input')?.id).toBe('date-field');
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const dp = new DatePicker({ disabled: true });
      dp.mount(container);
      expect(container.querySelector('input')?.disabled).toBe(true);
    });

    it('should be required when required=true', () => {
      const dp = new DatePicker({ required: true });
      dp.mount(container);
      expect(container.querySelector('input')?.required).toBe(true);
    });

    it('should set the min date attribute', () => {
      const dp = new DatePicker({ min: '2024-01-01' });
      dp.mount(container);
      expect(container.querySelector('input')?.min).toBe('2024-01-01');
    });

    it('should set the max date attribute', () => {
      const dp = new DatePicker({ max: '2024-12-31' });
      dp.mount(container);
      expect(container.querySelector('input')?.max).toBe('2024-12-31');
    });

    it('should not set min/max when not provided', () => {
      const dp = new DatePicker();
      dp.mount(container);
      expect(container.querySelector('input')?.min).toBe('');
      expect(container.querySelector('input')?.max).toBe('');
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onChange when a date is selected', () => {
      const onChange = jest.fn();
      const dp = new DatePicker({ onChange });
      dp.mount(container);
      const el = container.querySelector('input') as HTMLInputElement;
      el.value = '2024-06-15';
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should pass the selected date string to onChange', () => {
      const onChange = jest.fn();
      const dp = new DatePicker({ onChange });
      dp.mount(container);
      const el = container.querySelector('input') as HTMLInputElement;
      el.value = '2024-06-15';
      el.dispatchEvent(new Event('change'));
      expect(onChange.mock.calls[0]?.[2]).toBe('2024-06-15');
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('getValue', () => {
      it('should return the current date string', () => {
        const dp = new DatePicker({ value: '2024-03-20' });
        dp.mount(container);
        expect(dp.getValue()).toBe('2024-03-20');
      });

      it('should return empty string when not mounted', () => {
        const dp = new DatePicker();
        expect(dp.getValue()).toBe('');
      });
    });

    describe('setValue', () => {
      it('should update the displayed date', () => {
        const dp = new DatePicker({ value: '2024-01-01' });
        dp.mount(container);
        dp.setValue('2024-12-25');
        expect(container.querySelector('input')?.value).toBe('2024-12-25');
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const dp = new DatePicker();
      dp.mount(container);
      expect(dp.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const dp = new DatePicker();
      dp.mount(container);
      dp.unmount();
      expect(dp.isMounted()).toBe(false);
    });
  });
});

