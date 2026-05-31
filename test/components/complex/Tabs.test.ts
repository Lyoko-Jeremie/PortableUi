import {Tabs} from '../../../src/components/complex/Tabs';

describe('Tabs', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render tab headers', () => {
    const tabs = new Tabs({
      tabs: [
        {id: 'a', title: 'Tab A', content: 'Content A'},
        {id: 'b', title: 'Tab B', content: 'Content B'},
      ],
    });

    tabs.mount(container);

    expect(container.querySelectorAll('.portableui-tabs-button').length).toBe(2);
    expect(container.querySelector('.portableui-tabs-body')?.textContent).toContain('Content A');
  });

  it('should switch active tab', () => {
    const tabs = new Tabs({
      tabs: [
        {id: 'a', title: 'Tab A', content: 'Content A'},
        {id: 'b', title: 'Tab B', content: 'Content B'},
      ],
    });

    tabs.mount(container);
    container.querySelectorAll('.portableui-tabs-button')[1]?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(container.querySelector('.portableui-tabs-body')?.textContent).toContain('Content B');
  });

  it('should apply stretch layout through the header class', () => {
    const tabs = new Tabs({
      stretch: true,
      tabs: [
        {id: 'a', title: 'Tab A', content: 'Content A'},
        {id: 'b', title: 'Tab B', content: 'Content B'},
      ],
    });

    tabs.mount(container);

    const header = container.querySelector('.portableui-tabs-header');
    const button = container.querySelector('.portableui-tabs-button') as HTMLButtonElement | null;

    expect(header?.classList.contains('portableui-tabs-header-stretch')).toBe(true);
    expect(button?.style.flex).toBe('');
  });

  it('should append a tab via appendTab', () => {
    const tabs = new Tabs({
      tabs: [
        {id: 'a', title: 'Tab A', content: 'Content A'},
      ],
    });

    tabs.mount(container);
    tabs.appendTab({id: 'b', title: 'Tab B', content: 'Content B'});

    const buttons = container.querySelectorAll('.portableui-tabs-button');
    expect(buttons.length).toBe(2);
    expect(buttons[1]?.textContent).toBe('Tab B');
  });
});
