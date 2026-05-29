import { Image } from '../../../src/components/basic/Image';

describe('Image', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('rendering', () => {
    it('should render an <img> element', () => {
      const image = new Image();
      image.mount(container);
      expect(container.querySelector('img')).not.toBeNull();
    });

    it('should apply the default CSS class "portableui-image"', () => {
      const image = new Image();
      image.mount(container);
      expect(container.querySelector('img')?.classList.contains('portableui-image')).toBe(true);
    });

    it('should apply custom id and className', () => {
      const image = new Image({ id: 'hero-image', className: 'rounded' });
      image.mount(container);
      const el = container.querySelector('img');
      expect(el?.id).toBe('hero-image');
      expect(el?.classList.contains('rounded')).toBe(true);
    });
  });

  describe('props', () => {
    it('should set src and alt', () => {
      const image = new Image({ src: '/assets/photo.jpg', alt: 'Photo' });
      image.mount(container);
      const el = container.querySelector('img') as HTMLImageElement;
      expect(el.getAttribute('src')).toBe('/assets/photo.jpg');
      expect(el.alt).toBe('Photo');
    });

    it('should set numeric width and height', () => {
      const image = new Image({ width: 320, height: 180 });
      image.mount(container);
      const el = container.querySelector('img') as HTMLImageElement;
      expect(el.width).toBe(320);
      expect(el.height).toBe(180);
    });

    it('should set loading and decoding', () => {
      const image = new Image({ loading: 'lazy', decoding: 'async' });
      image.mount(container);
      const el = container.querySelector('img') as HTMLImageElement;
      expect(el.loading).toBe('lazy');
      expect(el.decoding).toBe('async');
    });
  });

  describe('events', () => {
    it('should call onLoad when load event is triggered', () => {
      const onLoad = jest.fn();
      const image = new Image({ onLoad });
      image.mount(container);
      const el = container.querySelector('img') as HTMLImageElement;
      el.dispatchEvent(new Event('load'));
      expect(onLoad).toHaveBeenCalledTimes(1);
      expect(onLoad.mock.calls[0]?.[0]).toBe(image);
    });

    it('should call onError when error event is triggered', () => {
      const onError = jest.fn();
      const image = new Image({ onError });
      image.mount(container);
      const el = container.querySelector('img') as HTMLImageElement;
      el.dispatchEvent(new Event('error'));
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0]?.[0]).toBe(image);
    });
  });

  describe('methods', () => {
    it('should return src via getSrc', () => {
      const image = new Image({ src: 'avatar.png' });
      image.mount(container);
      expect(image.getSrc()).toBe('avatar.png');
    });

    it('should update src via setSrc', () => {
      const image = new Image({ src: 'before.png' });
      image.mount(container);
      image.setSrc('after.png');
      expect((container.querySelector('img') as HTMLImageElement).getAttribute('src')).toBe('after.png');
    });

    it('should update alt via setAlt', () => {
      const image = new Image({ alt: 'Old' });
      image.mount(container);
      image.setAlt('New');
      expect((container.querySelector('img') as HTMLImageElement).alt).toBe('New');
    });
  });

  describe('lifecycle', () => {
    it('should be mounted after mount()', () => {
      const image = new Image();
      image.mount(container);
      expect(image.isMounted()).toBe(true);
    });

    it('should remove the element after unmount()', () => {
      const image = new Image();
      image.mount(container);
      image.unmount();
      expect(container.querySelector('img')).toBeNull();
    });
  });
});

