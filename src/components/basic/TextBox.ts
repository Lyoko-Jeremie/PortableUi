import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from './internal';

export interface TextBoxProps extends ComponentProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  cols?: number;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  onInput?: (self: TextBox, event: Event, value: string) => void;
  onChange?: (self: TextBox, event: Event, value: string) => void;
}

export interface TextBoxState extends ComponentState {
  value: string;
}

export class TextBox extends BaseComponent<TextBoxState> {
  constructor(props: TextBoxProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as TextBoxProps;
    const state = this.signalState();
    const textarea = document.createElement('textarea');

    applyCommonElementProps(textarea, props, 'portableui-textbox');
    textarea.value = state.value ?? props.value ?? '';
    textarea.placeholder = props.placeholder ?? '';
    textarea.rows = props.rows ?? 4;
    textarea.cols = props.cols ?? 30;
    textarea.disabled = props.disabled ?? false;
    textarea.readOnly = props.readonly ?? false;
    textarea.required = props.required ?? false;

    if (props.resize) {
      textarea.style.resize = props.resize;
    }

    textarea.addEventListener('input', (event) => {
      const currentState = this.signalState();
      props.onInput?.(this, event, textarea.value);
    });

    textarea.addEventListener('change', (event) => {
      const currentState = this.signalState();
      props.onChange?.(this, event, textarea.value);
    });

    return textarea;
  }

  getValue(): string {
    const textarea = this.element as HTMLTextAreaElement | null;
    return textarea?.value ?? '';
  }

  setValue(value: string): void {
    this.signalState({...this.signalState(), value});
  }
}

