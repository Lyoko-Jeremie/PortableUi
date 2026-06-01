import {BaseComponent} from '../../core';
import {effect} from 'alien-signals';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from './internal';

export interface LabelProps extends ComponentProps {
  text?: string;
  htmlFor?: string;
}

export interface LabelState extends ComponentState {
  text: string | null;
}

export class Label extends BaseComponent<LabelState> {
  constructor(props: LabelProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as LabelProps;
    const label = document.createElement('label');

    applyCommonElementProps(label, props, 'portableui-label');

    label.textContent = this.signalState().text ?? '';

    if (props.htmlFor) {
      label.htmlFor = props.htmlFor;
    }

    return label;
  }

  protected onPropsChanged(): boolean {
    if (this.element) {
      this.element.textContent = this.signalState().text ?? '';
      return true;
    }
    return false;
  }

  setText(text: string): void {
    this.signalState({...this.signalState(), text});
  }
}

