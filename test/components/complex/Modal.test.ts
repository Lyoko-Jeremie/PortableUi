import {Modal} from '../../../src/components/complex/Modal';

describe('Modal', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render hidden when visible is false', () => {
    const modal = new Modal({title: 'Title', visible: false});
    modal.mount(container);

    expect((container.querySelector('.portableui-modal') as HTMLElement).style.display).toBe('none');
  });

  it('should open and close via methods', () => {
    const modal = new Modal({title: 'Title'});
    modal.mount(container);

    modal.open();
    expect((container.querySelector('.portableui-modal') as HTMLElement).style.display).toBe('flex');

    modal.close();
    expect((container.querySelector('.portableui-modal') as HTMLElement).style.display).toBe('none');
  });

  it('should call onConfirm when confirm button clicked', () => {
    const onConfirm = jest.fn();
    const modal = new Modal({visible: true, onConfirm});
    modal.mount(container);

    container.querySelector('.portableui-modal-confirm')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

