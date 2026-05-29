import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface LabelProps extends ComponentProps {
  text?: string;
  htmlFor?: string;
}

export class Label extends BaseComponent {
  constructor(props: LabelProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as LabelProps;
    const label = document.createElement('label');

    applyCommonElementProps(label, props, 'portableui-label');
    label.textContent = props.text ?? '';

    if (props.htmlFor) {
      label.htmlFor = props.htmlFor;
    }

    return label;
  }

  setText(text: string): void {
    this.update({text});
  }
}

