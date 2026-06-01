import {BaseComponent} from '../../core';
import {effect} from 'alien-signals';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
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

export interface CheckboxState extends ComponentState {
  checked: boolean;
  label?: string;
}

export class Checkbox extends BaseComponent<CheckboxState> {
  constructor(props: CheckboxProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as CheckboxProps;
    const wrapper = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');

    input.type = 'checkbox';

    applyCommonElementProps(wrapper, props, 'portableui-checkbox');

    this.updateDom(input, text);

    input.addEventListener('change', (event) => {
      props.onChange?.(this, event, input.checked);
    });

    wrapper.appendChild(input);
    wrapper.appendChild(text);
    return wrapper;
  }

  private updateDom(input: HTMLInputElement, text: HTMLSpanElement): void {
    const props = this.props as CheckboxProps;

    input.checked = this.signalState().checked ?? false;
    input.disabled = props.disabled ?? false;
    input.required = props.required ?? false;
    input.indeterminate = props.indeterminate ?? false;

    if (props.name) {
      input.name = props.name;
    }

    if (props.value) {
      input.value = props.value;
    }

    text.textContent = this.signalState().label ?? '';
  }

  protected onPropsChanged(): boolean {
    const input = this.element?.querySelector('input');
    const text = this.element?.querySelector('span');
    if (input && text) {
      this.updateDom(input, text);
      return true; // 表示已手动处理，不需要全量 rerender
    }
    return false;
  }

  isChecked(): boolean {
    const input = this.getInputElement();
    return input?.checked ?? false;
  }

  setChecked(checked: boolean): void {
    this.signalState({...this.signalState(), checked});
  }

  private getInputElement(): HTMLInputElement | null {
    return this.element?.querySelector('input[type="checkbox"]') ?? null;
  }
}

