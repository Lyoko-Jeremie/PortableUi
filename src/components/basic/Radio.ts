import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface RadioProps extends ComponentProps {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  label?: string;
  onChange?: (self: Radio, event: Event, checked: boolean) => void;
}

export class Radio extends BaseComponent {
  constructor(props: RadioProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as RadioProps;
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');

    applyCommonElementProps(wrapper, props, 'portableui-radio');

    input.type = 'radio';
    input.checked = props.checked ?? false;
    input.disabled = props.disabled ?? false;
    input.required = props.required ?? false;

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
    return this.element?.querySelector('input[type="radio"]') ?? null;
  }
}

