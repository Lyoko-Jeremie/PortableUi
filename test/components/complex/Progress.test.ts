import {Progress} from '../../../src/components/complex/Progress';

describe('Progress', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render progress ratio', () => {
    const progress = new Progress({value: 40, max: 100});
    progress.mount(container);

    expect((container.querySelector('.portableui-progress-bar') as HTMLElement).style.width).toBe('40%');
  });

  it('should clamp value to max', () => {
    const progress = new Progress({value: 150, max: 100});
    progress.mount(container);

    expect((container.querySelector('.portableui-progress-bar') as HTMLElement).style.width).toBe('100%');
  });

  it('should update value by increment', () => {
    const progress = new Progress({value: 10, max: 100});
    progress.mount(container);

    progress.increment(15);

    expect((container.querySelector('.portableui-progress-bar') as HTMLElement).style.width).toBe('25%');
  });
});

