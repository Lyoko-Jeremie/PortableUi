import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface ButtonProps extends ComponentProps {
  text?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: (self: Button, event: MouseEvent) => void;
}

export class Button extends BaseComponent {
  constructor(props: ButtonProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ButtonProps;
    const button = document.createElement('button');

    applyCommonElementProps(button, props, 'portableui-button');
    button.type = props.type ?? 'button';
    button.disabled = props.disabled ?? false;
    button.textContent = props.text ?? '';

    if (props.onClick) {
      button.addEventListener('click', (event) => {
        props.onClick?.(this, event as MouseEvent);
      });
    }

    return button;
  }

  setText(text: string): void {
    this.update({text});
  }

  setDisabled(disabled: boolean): void {
    this.update({disabled});
  }
}

