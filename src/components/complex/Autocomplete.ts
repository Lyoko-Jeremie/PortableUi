import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export interface AutocompleteOption {
  label: string;
  value: string;
}

export interface AutocompleteProps extends ComponentProps {
  value?: string;
  placeholder?: string;
  options?: Array<string | AutocompleteOption>;
  minChars?: number;
  maxResults?: number;
  onInput?: (self: Autocomplete, event: Event, value: string) => void;
  onSelect?: (self: Autocomplete, event: MouseEvent, option: AutocompleteOption) => void;
  filter?: (query: string, option: AutocompleteOption) => boolean;
}

export class Autocomplete extends BaseComponent {
  constructor(props: AutocompleteProps = {}) {
    super(props);
    this.state = {
      query: props.value ?? '',
      open: false,
    };
  }

  protected render(): ComponentElement {
    const props = this.props as AutocompleteProps;
    const root = document.createElement('div');
    const input = document.createElement('input');
    const list = document.createElement('ul');

    applyCommonElementProps(root, props, 'portableui-autocomplete');

    input.type = 'text';
    input.value = String(this.state.query ?? '');
    input.placeholder = props.placeholder ?? '';
    input.className = 'portableui-autocomplete-input';

    const query = input.value.trim();
    const minChars = props.minChars ?? 1;
    const normalized = this.normalizeOptions(props.options ?? []);
    const maxResults = props.maxResults ?? 10;

    const matches = query.length < minChars
      ? []
      : normalized
        .filter((option) => props.filter ? props.filter(query, option) : option.label.toLowerCase().includes(query.toLowerCase()))
        .slice(0, maxResults);

    input.addEventListener('input', (event) => {
      const value = input.value;
      this.setState({query: value, open: value.trim().length >= minChars});
      props.onInput?.(this, event, value);
    });

    list.className = 'portableui-autocomplete-list';
    list.style.display = this.state.open && matches.length > 0 ? 'block' : 'none';

    for (const option of matches) {
      const item = document.createElement('li');
      item.className = 'portableui-autocomplete-item';
      item.textContent = option.label;
      item.addEventListener('click', (event) => {
        this.update({value: option.value});
        this.setState({query: option.value, open: false});
        props.onSelect?.(this, event as MouseEvent, option);
      });
      list.appendChild(item);
    }

    root.appendChild(input);
    root.appendChild(list);

    return root;
  }

  protected override rerender(): void {
    const currentRoot = this.element;
    const currentInput = currentRoot?.querySelector('.portableui-autocomplete-input') as HTMLInputElement | null;
    const shouldRestoreFocus = document.activeElement === currentInput;
    const selectionStart = currentInput?.selectionStart ?? null;
    const selectionEnd = currentInput?.selectionEnd ?? null;

    super.rerender();

    if (!shouldRestoreFocus) {
      return;
    }

    const nextInput = this.element?.querySelector('.portableui-autocomplete-input') as HTMLInputElement | null;
    nextInput?.focus();

    if (nextInput && selectionStart !== null && selectionEnd !== null) {
      nextInput.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  getValue(): string {
    return String((this.props as AutocompleteProps).value ?? this.state.query ?? '');
  }

  setValue(value: string): void {
    this.update({value});
    this.setState({query: value, open: false});
  }

  setOptions(options: Array<string | AutocompleteOption>): void {
    this.update({options});
  }

  private normalizeOptions(options: Array<string | AutocompleteOption>): AutocompleteOption[] {
    return options.map((option) => {
      if (typeof option === 'string') {
        return {label: option, value: option};
      }

      return option;
    });
  }
}

