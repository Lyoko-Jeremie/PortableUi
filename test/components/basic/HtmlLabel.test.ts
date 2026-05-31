import {HtmlLabel} from '../../../src/components/basic/HtmlLabel';

describe('HtmlLabel', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render a label with html content', () => {
    const label = new HtmlLabel({html: '<strong>Bold</strong>'});
    label.mount(container);

    const element = container.querySelector('label');
    expect(element?.classList.contains('portableui-html-label')).toBe(true);
    expect(element?.querySelector('strong')?.textContent).toBe('Bold');
  });

  it('should set htmlFor attribute', () => {
    const label = new HtmlLabel({html: 'Name', htmlFor: 'name-input'});
    label.mount(container);

    expect(container.querySelector('label')?.htmlFor).toBe('name-input');
  });

  it('should update html content via setHtml()', () => {
    const label = new HtmlLabel({html: 'old'});
    label.mount(container);

    label.setHtml('<em>new</em>');

    const element = container.querySelector('label');
    expect(element?.querySelector('em')?.textContent).toBe('new');
  });
});

