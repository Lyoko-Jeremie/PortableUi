import {Autocomplete} from '../../../src/components/complex/Autocomplete';

describe('Autocomplete', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should filter options when input changes', () => {
    const autocomplete = new Autocomplete({
      options: ['Apple', 'Banana', 'Orange'],
      minChars: 1,
    });

    autocomplete.mount(container);

    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'ap';
    input.dispatchEvent(new Event('input', {bubbles: true}));

    const items = container.querySelectorAll('.portableui-autocomplete-item');
    expect(items.length).toBe(1);
    expect(items[0]?.textContent).toBe('Apple');
  });

  it('should call onSelect when option clicked', () => {
    const onSelect = jest.fn();
    const autocomplete = new Autocomplete({
      options: ['Apple'],
      minChars: 1,
      onSelect,
    });

    autocomplete.mount(container);

    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input', {bubbles: true}));

    container.querySelector('.portableui-autocomplete-item')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(autocomplete.getValue()).toBe('Apple');
  });
});

