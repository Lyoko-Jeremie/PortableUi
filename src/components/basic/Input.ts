import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
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
  onInput?: (self: Input, event: Event, value: string) => void;
  onChange?: (self: Input, event: Event, value: string) => void;
}

export interface InputState extends ComponentState {
  value: string;
}

export class Input extends BaseComponent<InputState> {
  constructor(props: InputProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as InputProps;
    const state = this.signalState();
    const input = document.createElement('input');

    applyCommonElementProps(input, props, 'portableui-input');
    input.type = props.type ?? 'text';
    input.value = state.value ?? props.value ?? '';
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
      props.onInput?.(this, event, input.value);
    });

    input.addEventListener('change', (event) => {
      props.onChange?.(this, event, input.value);
    });

    return input;
  }

  getValue(): string {
    const input = this.element as HTMLInputElement | null;
    return input?.value ?? '';
  }

  setValue(value: string): void {
    if (this.getValue() === value) {
      return;
    }

    this.signalState({...this.signalState(), value});
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
