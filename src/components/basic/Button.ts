import {BaseComponent} from '../../core';
import {effect} from 'alien-signals';
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
    const button = document.createElement('button');

    applyCommonElementProps(button, props, 'portableui-button');
    button.type = props.type ?? 'button';

    button.disabled = this.signalState().disabled ?? false;
    effect(() => {
      button.disabled = this.signalState().disabled ?? false;
    });

    button.textContent = this.signalState().text ?? '';
    effect(() => {
      button.textContent = this.signalState().text ?? '';
    });

    if (props.onClick) {
      button.addEventListener('click', (event) => {
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

