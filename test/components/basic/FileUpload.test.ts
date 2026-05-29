import { FileUpload } from '../../../src/components/basic/FileUpload';

describe('FileUpload', () => {
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
    it('should render an <input type="file"> element', () => {
      const fu = new FileUpload();
      fu.mount(container);
      expect(container.querySelector('input[type="file"]')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-file-upload"', () => {
      const fu = new FileUpload();
      fu.mount(container);
      expect(container.querySelector('input')?.classList.contains('portableui-file-upload')).toBe(true);
    });

    it('should apply a custom id', () => {
      const fu = new FileUpload({ id: 'file-field' });
      fu.mount(container);
      expect(container.querySelector('input')?.id).toBe('file-field');
    });
  });

  // ── Props ────────────────────────────────────────────────────────

  describe('props', () => {
    it('should be disabled when disabled=true', () => {
      const fu = new FileUpload({ disabled: true });
      fu.mount(container);
      expect(container.querySelector('input')?.disabled).toBe(true);
    });

    it('should support multiple file selection', () => {
      const fu = new FileUpload({ multiple: true });
      fu.mount(container);
      expect((container.querySelector('input') as HTMLInputElement).multiple).toBe(true);
    });

    it('should not support multiple by default', () => {
      const fu = new FileUpload();
      fu.mount(container);
      expect((container.querySelector('input') as HTMLInputElement).multiple).toBe(false);
    });

    it('should set the accept attribute', () => {
      const fu = new FileUpload({ accept: 'image/*' });
      fu.mount(container);
      expect(container.querySelector('input')?.accept).toBe('image/*');
    });

    it('should not set accept when not provided', () => {
      const fu = new FileUpload();
      fu.mount(container);
      expect(container.querySelector('input')?.accept).toBe('');
    });

    it('should set the capture attribute', () => {
      const fu = new FileUpload({ capture: 'environment' });
      fu.mount(container);
      expect(container.querySelector('input')?.getAttribute('capture')).toBe('environment');
    });
  });

  // ── 事件 ─────────────────────────────────────────────────────────

  describe('events', () => {
    it('should call onChange when files are selected', () => {
      const onChange = jest.fn();
      const fu = new FileUpload({ onChange });
      fu.mount(container);
      const el = container.querySelector('input') as HTMLInputElement;
      el.dispatchEvent(new Event('change'));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('should pass a File array to onChange', () => {
      const onChange = jest.fn();
      const fu = new FileUpload({ onChange });
      fu.mount(container);
      const el = container.querySelector('input') as HTMLInputElement;
      el.dispatchEvent(new Event('change'));
      // files is null/empty in jsdom — expect an array
      const files = onChange.mock.calls[0]?.[2];
      expect(Array.isArray(files)).toBe(true);
    });
  });

  // ── 方法 ─────────────────────────────────────────────────────────

  describe('methods', () => {
    describe('getFiles', () => {
      it('should return an empty array when no files are selected', () => {
        const fu = new FileUpload();
        fu.mount(container);
        expect(fu.getFiles()).toEqual([]);
      });

      it('should return an empty array when not mounted', () => {
        const fu = new FileUpload();
        expect(fu.getFiles()).toEqual([]);
      });
    });

    describe('clearFiles', () => {
      it('should not throw when called on a mounted input', () => {
        const fu = new FileUpload();
        fu.mount(container);
        expect(() => fu.clearFiles()).not.toThrow();
      });
    });
  });

  // ── 生命周期 ──────────────────────────────────────────────────────

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const fu = new FileUpload();
      fu.mount(container);
      expect(fu.isMounted()).toBe(true);
    });

    it('should be unmounted after unmount()', () => {
      const fu = new FileUpload();
      fu.mount(container);
      fu.unmount();
      expect(fu.isMounted()).toBe(false);
    });

    it('should remove the DOM element after unmount()', () => {
      const fu = new FileUpload();
      fu.mount(container);
      fu.unmount();
      expect(container.querySelector('input[type="file"]')).toBeNull();
    });
  });
});

