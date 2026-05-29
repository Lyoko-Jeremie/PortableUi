import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
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

export class TextBox extends BaseComponent {
  constructor(props: TextBoxProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as TextBoxProps;
    const textarea = document.createElement('textarea');

    applyCommonElementProps(textarea, props, 'portableui-textbox');
    textarea.value = props.value ?? '';
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
      props.onInput?.(this, event, textarea.value);
    });

    textarea.addEventListener('change', (event) => {
      props.onChange?.(this, event, textarea.value);
    });

    return textarea;
  }

  getValue(): string {
    const textarea = this.element as HTMLTextAreaElement | null;
    return textarea?.value ?? '';
  }

  setValue(value: string): void {
    this.update({value});
  }
}

