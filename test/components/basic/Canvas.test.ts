import { Canvas } from '../../../src/components/basic/Canvas';

describe('Canvas', () => {
  let container: HTMLElement;
  let contextMock: { clearRect: jest.Mock };
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalToDataURL: typeof HTMLCanvasElement.prototype.toDataURL;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    contextMock = {
      clearRect: jest.fn(),
    };

    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalToDataURL = HTMLCanvasElement.prototype.toDataURL;

    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      writable: true,
      value: jest.fn(() => contextMock as unknown as RenderingContext),
    });

    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      writable: true,
      value: jest.fn(() => 'data:image/png;base64,mock'),
    });
  });

  afterEach(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      writable: true,
      value: originalGetContext,
    });

    Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
      configurable: true,
      writable: true,
      value: originalToDataURL,
    });
    document.body.removeChild(container);
  });

  describe('rendering', () => {
    it('should render a <canvas> element', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      expect(container.querySelector('canvas')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-canvas"', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      expect(container.querySelector('canvas')?.classList.contains('portableui-canvas')).toBe(true);
    });

    it('should use default size 300x150', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      const el = container.querySelector('canvas') as HTMLCanvasElement;
      expect(el.width).toBe(300);
      expect(el.height).toBe(150);
    });

    it('should apply custom id and size', () => {
      const canvas = new Canvas({ id: 'plot', width: 640, height: 480 });
      canvas.mount(container);
      const el = container.querySelector('canvas') as HTMLCanvasElement;
      expect(el.id).toBe('plot');
      expect(el.width).toBe(640);
      expect(el.height).toBe(480);
    });
  });

  describe('events', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn();
      const canvas = new Canvas({ onClick });
      canvas.mount(container);
      container.querySelector('canvas')?.dispatchEvent(new MouseEvent('click'));
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.calls[0]?.[0]).toBe(canvas);
    });

    it('should call onReady with context after mount', () => {
      const onReady = jest.fn();
      const canvas = new Canvas({ onReady });
      canvas.mount(container);
      expect(onReady).toHaveBeenCalledTimes(1);
      expect(onReady.mock.calls[0]?.[0]).toBe(canvas);
      expect(onReady.mock.calls[0]?.[1]).toBe(contextMock);
    });

    it('should call onDraw when 2d context is available', () => {
      const onDraw = jest.fn();
      const canvas = new Canvas({ onDraw });
      canvas.mount(container);
      expect(onDraw).toHaveBeenCalledTimes(1);
      expect(onDraw.mock.calls[0]?.[0]).toBe(canvas);
      expect(onDraw.mock.calls[0]?.[1]).toBe(contextMock);
    });
  });

  describe('methods', () => {
    it('should return context via getContext', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      expect(canvas.getContext('2d')).toBe(contextMock);
    });

    it('should clear the canvas using clearRect', () => {
      const canvas = new Canvas({ width: 400, height: 220 });
      canvas.mount(container);
      canvas.clear();
      expect(contextMock.clearRect).toHaveBeenCalledWith(0, 0, 400, 220);
    });

    it('should update size via setSize', () => {
      const canvas = new Canvas({ width: 100, height: 100 });
      canvas.mount(container);
      canvas.setSize(200, 160);
      const el = container.querySelector('canvas') as HTMLCanvasElement;
      expect(el.width).toBe(200);
      expect(el.height).toBe(160);
    });

    it('should export image data via toDataURL', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      expect(canvas.toDataURL('image/png')).toBe('data:image/png;base64,mock');
    });
  });

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      expect(canvas.isMounted()).toBe(true);
    });

    it('should remove the element after unmount()', () => {
      const canvas = new Canvas();
      canvas.mount(container);
      canvas.unmount();
      expect(container.querySelector('canvas')).toBeNull();
    });
  });
});
