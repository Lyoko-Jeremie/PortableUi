import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface DatePickerProps extends ComponentProps {
  value?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: Event, value: string) => void;
}

export class DatePicker extends BaseComponent {
  constructor(props: DatePickerProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as DatePickerProps;
    const input = document.createElement('input');

    applyCommonElementProps(input, props, 'portableui-date-picker');

    input.type = 'date';
    input.value = props.value ?? '';
    input.disabled = props.disabled ?? false;
    input.required = props.required ?? false;

    if (props.min) {
      input.min = props.min;
    }

    if (props.max) {
      input.max = props.max;
    }

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
}

