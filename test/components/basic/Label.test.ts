import { Label } from '../../../src/components/basic/Label';

describe('Label', () => {
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
    it('should render a <label> element', () => {
      const label = new Label();
      label.mount(container);
      expect(container.querySelector('label')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-label"', () => {
      const label = new Label();
      label.mount(container);
      expect(container.querySelector('label')?.classList.contains('portableui-label')).toBe(true);
    });

    it('should render with empty text by default', () => {
      const label = new Label();
      label.mount(container);
      expect(container.querySelector('label')?.textContent).toBe('');
    });

    it('should render provided text', () => {
      const label = new Label({ text: 'My Label' });
      label.mount(container);
      expect(container.querySelector('label')?.textContent).toBe('My Label');
    });

    it('should apply a custom id', () => {
      const label = new Label({ id: 'my-label' });
      label.mount(container);
      expect(container.querySelector('label')?.id).toBe('my-label');
    });

    it('should merge custom className with the default class', () => {
      const label = new Label({ className: 'extra' });
      label.mount(container);
      const el = container.querySelector('label');
      expect(el?.classList.contains('portableui-label')).toBe(true);
      expect(el?.classList.contains('extra')).toBe(true);
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should set the htmlFor attribute', () => {
      const label = new Label({ htmlFor: 'input-id' });
      label.mount(container);
      expect(container.querySelector('label')?.htmlFor).toBe('input-id');
    });

    it('should not set htmlFor when not provided', () => {
      const label = new Label();
      label.mount(container);
      expect(container.querySelector('label')?.htmlFor).toBe('');
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('setText', () => {
      it('should update the label text', () => {
        const label = new Label({ text: 'Old' });
        label.mount(container);
        label.setText('New');
        expect(container.querySelector('label')?.textContent).toBe('New');
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const label = new Label();
      label.mount(container);
      expect(label.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const label = new Label();
      label.mount(container);
      label.unmount();
      expect(label.isMounted()).toBe(false);
    });

    it('should remove the DOM element after unmount()', () => {
      const label = new Label();
      label.mount(container);
      label.unmount();
      expect(container.querySelector('label')).toBeNull();
    });
  });
});

