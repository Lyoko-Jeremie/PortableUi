import { Slider } from '../../../src/components/basic/Slider';

describe('Slider', () => {
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
    it('should render a wrapper <div> element', () => {
      const slider = new Slider();
      slider.mount(container);
      expect(container.querySelector('div.portableui-slider')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-slider"', () => {
      const slider = new Slider();
      slider.mount(container);
      expect(container.querySelector('div')?.classList.contains('portableui-slider')).toBe(true);
    });

    it('should render an <input type="range"> inside the wrapper', () => {
      const slider = new Slider();
      slider.mount(container);
      expect(container.querySelector('input[type="range"]')).not.toBeNull();
    });

    it('should default min=0, max=100, step=1', () => {
      const slider = new Slider();
      slider.mount(container);
      const el = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(el.min).toBe('0');
      expect(el.max).toBe('100');
      expect(el.step).toBe('1');
    });

    it('should use provided min, max, step', () => {
      const slider = new Slider({ min: 10, max: 50, step: 5 });
      slider.mount(container);
      const el = container.querySelector('input[type="range"]') as HTMLInputElement;
      expect(el.min).toBe('10');
      expect(el.max).toBe('50');
      expect(el.step).toBe('5');
    });

    it('should render with provided initial value', () => {
      const slider = new Slider({ value: 42 });
      slider.mount(container);
      expect((container.querySelector('input[type="range"]') as HTMLInputElement).value).toBe('42');
    });

    it('should show the value display span by default', () => {
      const slider = new Slider({ value: 30 });
      slider.mount(container);
      expect(container.querySelector('.portableui-slider-value')).not.toBeNull();
      expect(container.querySelector('.portableui-slider-value')?.textContent).toBe('30');
    });

    it('should hide the value display when showValue=false', () => {
      const slider = new Slider({ showValue: false });
      slider.mount(container);
      expect(container.querySelector('.portableui-slider-value')).toBeNull();
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const slider = new Slider({ disabled: true });
      slider.mount(container);
      expect((container.querySelector('input[type="range"]') as HTMLInputElement).disabled).toBe(true);
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onInput when slider moves', () => {
      const onInput = jest.fn();
      const slider = new Slider({ onInput });
      slider.mount(container);
      const el = container.querySelector('input[type="range"]') as HTMLInputElement;
      el.value = '60';
      el.dispatchEvent(new Event('input'));
      expect(onInput).toHaveBeenCalledTimes(1);
    });

    it('should pass numeric value to onInput', () => {
      const onInput = jest.fn();
      const slider = new Slider({ onInput });
      slider.mount(container);
      const el = container.querySelector('input[type="range"]') as HTMLInputElement;
      el.value = '75';
      el.dispatchEvent(new Event('input'));
      expect(onInput.mock.calls[0]?.[2]).toBe(75);
    });

    it('should update value display on input', () => {
      const slider = new Slider({ value: 0 });
      slider.mount(container);
      const el = container.querySelector('input[type="range"]') as HTMLInputElement;
      el.value = '55';
      el.dispatchEvent(new Event('input'));
      expect(container.querySelector('.portableui-slider-value')?.textContent).toBe('55');
    });

    it('should call onChange when the value is committed', () => {
      const onChange = jest.fn();
      const slider = new Slider({ onChange });
      slider.mount(container);
      const el = container.querySelector('input[type="range"]') as HTMLInputElement;
      el.value = '80';
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('getValue', () => {
      it('should return the current numeric value', () => {
        const slider = new Slider({ value: 25 });
        slider.mount(container);
        expect(slider.getValue()).toBe(25);
      });

      it('should return 0 when not mounted', () => {
        const slider = new Slider();
        expect(slider.getValue()).toBe(0);
      });
    });

    describe('setValue', () => {
      it('should update the slider value', () => {
        const slider = new Slider({ min: 0, max: 100, value: 10 });
        slider.mount(container);
        slider.setValue(90);
        expect((container.querySelector('input[type="range"]') as HTMLInputElement).value).toBe('90');
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const slider = new Slider();
      slider.mount(container);
      expect(slider.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const slider = new Slider();
      slider.mount(container);
      slider.unmount();
      expect(slider.isMounted()).toBe(false);
    });
  });
});

