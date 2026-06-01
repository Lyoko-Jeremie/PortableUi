import {CascadingSelect} from '../../../src/components/complex/CascadingSelect';

describe('CascadingSelect', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render level selects based on selected path', () => {
    const component = new CascadingSelect({
      options: [
        {
          label: 'Asia',
          value: 'asia',
          children: [{label: 'China', value: 'china'}],
        },
      ],
      valuePath: ['asia'],
    });

    component.mount(container);

    expect(container.querySelectorAll('.portableui-cascading-select-level').length).toBe(2);
  });

  it('should call onChange with next path', () => {
    const onChange = jest.fn();
    const component = new CascadingSelect({
      options: [{label: 'Asia', value: 'asia'}],
      onChange,
    });

    component.mount(container);

    const select = container.querySelector('select') as HTMLSelectElement;
    select.value = 'asia';
    select.dispatchEvent(new Event('change', {bubbles: true}));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(component.getValuePath()).toEqual(['asia']);
  });

  it('should replace parent selection without keeping stale child path', () => {
    const component = new CascadingSelect({
      options: [
        {
          label: 'China',
          value: 'cn',
          children: [{label: 'Shanghai', value: 'sh'}],
        },
        {
          label: 'USA',
          value: 'us',
          children: [{label: 'New York', value: 'ny'}],
        },
      ],
      valuePath: ['cn', 'sh'],
    });

    component.mount(container);

    const level0 = container.querySelector('select[data-level="0"]') as HTMLSelectElement;
    level0.value = 'us';
    level0.dispatchEvent(new Event('change', {bubbles: true}));

    expect(component.getValuePath()).toEqual(['us']);
  });
});

