import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface InputProps extends ComponentProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  name?: string;
  autocomplete?: string;
  minLength?: number;
  maxLength?: number;
  onInput?: (event: Event, value: string) => void;
  onChange?: (event: Event, value: string) => void;
}

export class Input extends BaseComponent {
  constructor(props: InputProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as InputProps;
    const input = document.createElement('input');

    applyCommonElementProps(input, props, 'portableui-input');
    input.type = props.type ?? 'text';
    input.value = props.value ?? '';
    input.placeholder = props.placeholder ?? '';
    input.disabled = props.disabled ?? false;
    input.readOnly = props.readonly ?? false;
    input.required = props.required ?? false;

    if (props.name) {
      input.name = props.name;
    }

    if (props.autocomplete) {
      input.setAttribute('autocomplete', props.autocomplete);
    }

    if (typeof props.minLength === 'number') {
      input.minLength = props.minLength;
    }

    if (typeof props.maxLength === 'number') {
      input.maxLength = props.maxLength;
    }

    input.addEventListener('input', (event) => {
      props.onInput?.(event, input.value);
    });

    input.addEventListener('change', (event) => {
      props.onChange?.(event, input.value);
    });

    return input;
  }

  getValue(): string {
    const input = this.element as HTMLInputElement | null;
    return input?.value ?? '';
  }

  setValue(value: string): void {
    this.update({value});
  }

  focus(): void {
    const input = this.element as HTMLInputElement | null;
    input?.focus();
  }

  blur(): void {
    const input = this.element as HTMLInputElement | null;
    input?.blur();
  }
}
