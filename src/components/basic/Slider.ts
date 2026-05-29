import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface SliderProps extends ComponentProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  showValue?: boolean;
  onInput?: (event: Event, value: number) => void;
  onChange?: (event: Event, value: number) => void;
}

export class Slider extends BaseComponent {
  constructor(props: SliderProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as SliderProps;
    const wrapper = document.createElement('div');
    const input = document.createElement('input');

    applyCommonElementProps(wrapper, props, 'portableui-slider');

    input.type = 'range';
    input.min = String(props.min ?? 0);
    input.max = String(props.max ?? 100);
    input.step = String(props.step ?? 1);
    input.value = String(props.value ?? props.min ?? 0);
    input.disabled = props.disabled ?? false;

    wrapper.appendChild(input);

    let valueDisplay: HTMLSpanElement | null = null;
    if (props.showValue ?? true) {
      valueDisplay = document.createElement('span');
      valueDisplay.className = 'portableui-slider-value';
      valueDisplay.textContent = input.value;
      wrapper.appendChild(valueDisplay);
    }

    input.addEventListener('input', (event) => {
      const currentValue = Number(input.value);
      if (valueDisplay) {
        valueDisplay.textContent = input.value;
      }
      props.onInput?.(event, currentValue);
    });

    input.addEventListener('change', (event) => {
      props.onChange?.(event, Number(input.value));
    });

    return wrapper;
  }

  getValue(): number {
    const input = this.getInputElement();
    return Number(input?.value ?? 0);
  }

  setValue(value: number): void {
    this.update({value});
  }

  private getInputElement(): HTMLInputElement | null {
    return this.element?.querySelector('input[type="range"]') ?? null;
  }
}

