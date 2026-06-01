import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from './internal';

export interface ButtonProps extends ComponentProps {
  text?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (self: Button, event: MouseEvent) => void;
}

export interface ButtonState extends ComponentState {
  text: string | null;
  disabled: boolean;
}

export class Button extends BaseComponent<ButtonState> {
  constructor(props: ButtonProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ButtonProps;
    const state = this.signalState();
    const button = document.createElement('button');

    applyCommonElementProps(button, props, 'portableui-button');
    button.type = props.type ?? 'button';
    button.disabled = state.disabled ?? props.disabled ?? false;
    button.textContent = (state.text ?? props.text) ?? '';

    if (props.onClick) {
      button.addEventListener('click', (event) => {
        const currentState = this.signalState();
        props.onClick?.(this, event as MouseEvent);
      });
    }

    return button;
  }

  setText(text: string): void {
    this.signalState({...this.signalState(), text});
  }

  setDisabled(disabled: boolean): void {
    this.signalState({...this.signalState(), disabled});
  }
}

