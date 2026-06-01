import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from './internal';

export interface DatePickerProps extends ComponentProps {
  value?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (self: DatePicker, event: Event, value: string) => void;
}

export interface DatePickerState extends ComponentState {
  value: string;
}

export class DatePicker extends BaseComponent<DatePickerState> {
  constructor(props: DatePickerProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as DatePickerProps;
    const state = this.signalState();
    const input = document.createElement('input');

    applyCommonElementProps(input, props, 'portableui-date-picker');

    input.type = 'date';
    input.value = state.value ?? props.value ?? '';
    input.disabled = props.disabled ?? false;
    input.required = props.required ?? false;

    if (props.min) {
      input.min = props.min;
    }

    if (props.max) {
      input.max = props.max;
    }

    input.addEventListener('change', (event) => {
      const currentState = this.signalState();
      props.onChange?.(this, event, input.value);
    });

    return input;
  }

  getValue(): string {
    const input = this.element as HTMLInputElement | null;
    return input?.value ?? '';
  }

  setValue(value: string): void {
    this.signalState({...this.signalState(), value});
  }
}

