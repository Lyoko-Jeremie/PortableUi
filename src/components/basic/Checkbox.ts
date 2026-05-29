import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface CheckboxProps extends ComponentProps {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  label?: string;
  indeterminate?: boolean;
  onChange?: (self: Checkbox, event: Event, checked: boolean) => void;
}

export class Checkbox extends BaseComponent {
  constructor(props: CheckboxProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as CheckboxProps;
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');

    applyCommonElementProps(wrapper, props, 'portableui-checkbox');

    input.type = 'checkbox';
    input.checked = props.checked ?? false;
    input.disabled = props.disabled ?? false;
    input.required = props.required ?? false;
    input.indeterminate = props.indeterminate ?? false;

    if (props.name) {
      input.name = props.name;
    }

    if (props.value) {
      input.value = props.value;
    }

    text.textContent = props.label ?? '';

    input.addEventListener('change', (event) => {
      props.onChange?.(this, event, input.checked);
    });

    wrapper.appendChild(input);
    wrapper.appendChild(text);
    return wrapper;
  }

  isChecked(): boolean {
    const input = this.getInputElement();
    return input?.checked ?? false;
  }

  setChecked(checked: boolean): void {
    this.update({checked});
  }

  private getInputElement(): HTMLInputElement | null {
    return this.element?.querySelector('input[type="checkbox"]') ?? null;
  }
}

