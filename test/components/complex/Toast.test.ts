import {Toast} from '../../../src/components/complex/Toast';

describe('Toast', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.useRealTimers();
  });

  it('should render with message', () => {
    const toast = new Toast({message: 'Hello', visible: true});
    toast.mount(container);

    expect(container.querySelector('.portableui-toast-message')?.textContent).toBe('Hello');
  });

  it('should hide when close button clicked', () => {
    const toast = new Toast({message: 'Hi', visible: true});
    toast.mount(container);

    container.querySelector('.portableui-toast-close')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect((container.querySelector('.portableui-toast') as HTMLElement).style.display).toBe('none');
  });

  it('should auto close after duration', () => {
    jest.useFakeTimers();

    const toast = new Toast({message: 'Timed', visible: true, duration: 1000});
    toast.mount(container);

    jest.advanceTimersByTime(1000);

    expect((container.querySelector('.portableui-toast') as HTMLElement).style.display).toBe('none');
  });
});

