import {HtmlContainer} from '../../../src/components/container/HtmlContainer';

describe('HtmlContainer', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('should render html string content', () => {
    const comp = new HtmlContainer({html: '<span class="inner">Hello</span>'});
    comp.mount(container);

    const element = comp.getElement();
    expect(element?.classList.contains('portableui-html-container')).toBe(true);
    expect(element?.querySelector('.inner')?.textContent).toBe('Hello');
  });

  test('should render native html element content', () => {
    const nativeElement = document.createElement('section');
    nativeElement.className = 'native-node';
    nativeElement.textContent = 'Native Content';

    const comp = new HtmlContainer({html: nativeElement});
    comp.mount(container);

    expect(comp.getElement()?.querySelector('.native-node')?.textContent).toBe('Native Content');
  });

  test('should update html content by setHtmlContent()', () => {
    const comp = new HtmlContainer({html: '<div>old</div>'});
    comp.mount(container);

    comp.setHtmlContent('<div class="next">new</div>');

    expect(comp.getElement()?.querySelector('.next')?.textContent).toBe('new');
  });
});

