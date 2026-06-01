import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from './internal';

export interface SliderProps extends ComponentProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  disabled?: boolean;
  showValue?: boolean;
  onInput?: (self: Slider, event: Event, value: number) => void;
  onChange?: (self: Slider, event: Event, value: number) => void;
}

export interface SliderState extends ComponentState {
  value: number;
}

export class Slider extends BaseComponent<SliderState> {
  constructor(props: SliderProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as SliderProps;
    const state = this.signalState();
    const wrapper = document.createElement('div');
    const input = document.createElement('input');

    applyCommonElementProps(wrapper, props, 'portableui-slider');

    input.type = 'range';
    input.min = String(props.min ?? 0);
    input.max = String(props.max ?? 100);
    input.step = String(props.step ?? 1);
    input.value = String(state.value ?? props.value ?? props.min ?? 0);
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
      const currentState = this.signalState();
      props.onInput?.(this, event, currentValue);
    });

    input.addEventListener('change', (event) => {
      const currentState = this.signalState();
      props.onChange?.(this, event, Number(input.value));
    });

    return wrapper;
  }

  getValue(): number {
    const input = this.getInputElement();
    return Number(input?.value ?? 0);
  }

  setValue(value: number): void {
    this.signalState({...this.signalState(), value});
  }

  private getInputElement(): HTMLInputElement | null {
    return this.element?.querySelector('input[type="range"]') ?? null;
  }
}

