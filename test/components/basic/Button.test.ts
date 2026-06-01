import { Button } from '../../../src';

describe('Button', () => {
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
    it('should render a <button> element', () => {
      const btn = new Button();
      btn.mount(container);
      expect(container.querySelector('button')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-button"', () => {
      const btn = new Button();
      btn.mount(container);
      expect(container.querySelector('button')?.classList.contains('portableui-button')).toBe(true);
    });

    it('should have default type "button"', () => {
      const btn = new Button();
      btn.mount(container);
      expect(container.querySelector('button')?.type).toBe('button');
    });

    it('should render with empty text by default', () => {
      const btn = new Button();
      btn.mount(container);
      expect(container.querySelector('button')?.textContent).toBe('');
    });

    it('should render provided text', () => {
      const btn = new Button({ text: 'Click me' });
      btn.mount(container);
      expect(container.querySelector('button')?.textContent).toBe('Click me');
    });

    it('should apply a custom id', () => {
      const btn = new Button({ id: 'my-btn' });
      btn.mount(container);
      expect(container.querySelector('button')?.id).toBe('my-btn');
    });

    it('should merge custom className with the default class', () => {
      const btn = new Button({ className: 'extra' });
      btn.mount(container);
      const el = container.querySelector('button');
      expect(el?.classList.contains('portableui-button')).toBe(true);
      expect(el?.classList.contains('extra')).toBe(true);
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it.each(['button', 'submit', 'reset'] as const)('should set type="%s"', (type) => {
      const btn = new Button({ type });
      btn.mount(container);
      expect(container.querySelector('button')?.type).toBe(type);
    });

    it('should be disabled when disabled=true', () => {
      const btn = new Button({ disabled: true });
      btn.mount(container);
      expect(container.querySelector('button')?.disabled).toBe(true);
    });

    it('should not be disabled by default', () => {
      const btn = new Button();
      btn.mount(container);
      expect(container.querySelector('button')?.disabled).toBe(false);
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onClick when the button is clicked', () => {
      const onClick = jest.fn();
      const btn = new Button({ onClick });
      btn.mount(container);
      container.querySelector('button')?.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should pass the Button instance as the first argument to onClick', () => {
      const onClick = jest.fn();
      const btn = new Button({ onClick });
      btn.mount(container);
      container.querySelector('button')?.click();
      expect(onClick.mock.calls[0]?.[0]).toBe(btn);
    });

    it('should not throw when onClick is not provided', () => {
      const btn = new Button();
      btn.mount(container);
      expect(() => container.querySelector('button')?.click()).not.toThrow();
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('setText', () => {
      it('should update the button text', () => {
        const btn = new Button({ text: 'Old' });
        btn.mount(container);
        btn.setText('New');
        expect(container.querySelector('button')?.textContent).toBe('New');
      });
    });

    describe('setDisabled', () => {
      it('should disable the button', () => {
        const btn = new Button();
        btn.mount(container);
        btn.setDisabled(true);
        expect(container.querySelector('button')?.disabled).toBe(true);
      });

      it('should re-enable the button', () => {
        const btn = new Button({ disabled: true });
        btn.mount(container);
        btn.setDisabled(false);
        expect(container.querySelector('button')?.disabled).toBe(false);
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const btn = new Button();
      btn.mount(container);
      expect(btn.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const btn = new Button();
      btn.mount(container);
      btn.unmount();
      expect(btn.isMounted()).toBe(false);
    });

    it('should remove the DOM element after unmount()', () => {
      const btn = new Button();
      btn.mount(container);
      btn.unmount();
      expect(container.querySelector('button')).toBeNull();
    });


    it('should not mount twice', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const btn = new Button();
      btn.mount(container);
      btn.mount(container);
      expect(container.querySelectorAll('button').length).toBe(1);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      warnSpy.mockRestore();
    });
  });
});

