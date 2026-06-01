import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
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

export interface AutocompleteState extends ComponentState {
  query: string;
  open: boolean;
  value?: string;
  options?: Array<string | AutocompleteOption>;
}

export class Autocomplete extends BaseComponent<AutocompleteState> {
  constructor(props: AutocompleteProps = {}) {
    super(props);
    this.signalState({...this.signalState(), query: props.value ?? '', open: false});
  }

  protected render(): ComponentElement {
    const props = this.props as AutocompleteProps;
    const state = this.signalState();
    const root = document.createElement('div');
    const input = document.createElement('input');
    const list = document.createElement('ul');

    applyCommonElementProps(root, props, 'portableui-autocomplete');

    input.type = 'text';
    input.value = String(state.query ?? '');
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
      const currentState = this.signalState();
      this.signalState({...currentState, query: value, open: value.trim().length >= minChars});
      props.onInput?.(this, event, value);
    });

    list.className = 'portableui-autocomplete-list';
    list.style.display = state.open && matches.length > 0 ? 'block' : 'none';

    for (const option of matches) {
      const item = document.createElement('li');
      item.className = 'portableui-autocomplete-item';
      item.textContent = option.label;
      item.addEventListener('click', (event) => {
        const currentState = this.signalState();
        this.signalState({...currentState, query: option.value, open: false, value: option.value});
        props.onSelect?.(this, event as MouseEvent, option);
      });
      list.appendChild(item);
    }

    root.appendChild(input);
    root.appendChild(list);

    return root;
  }


  getValue(): string {
    const state = this.signalState();
    return String((state as AutocompleteState & { value?: string }).value ?? (this.props as AutocompleteProps).value ?? state.query ?? '');
  }

  setValue(value: string): void {
    const currentState = this.signalState();
    this.signalState({...currentState, value, query: value, open: false});
  }

  setOptions(options: Array<string | AutocompleteOption>): void {
    const currentState = this.signalState();
    this.signalState({...currentState, options: [...options]});
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

