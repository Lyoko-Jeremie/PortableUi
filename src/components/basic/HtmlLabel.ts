import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from './internal';

export interface HtmlLabelProps extends ComponentProps {
  html?: string;
  htmlFor?: string;
}

export interface HtmlLabelState extends ComponentState {
  html: string;
}

export class HtmlLabel extends BaseComponent<HtmlLabelState> {
  constructor(props: HtmlLabelProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as HtmlLabelProps;
    const state = this.signalState();
    const label = document.createElement('label');

    applyCommonElementProps(label, props, 'portableui-html-label');
    label.innerHTML = state.html ?? props.html ?? '';

    if (props.htmlFor) {
      label.htmlFor = props.htmlFor;
    }

    return label;
  }

  setHtml(html: string): void {
    this.signalState({...this.signalState(), html});
  }
}

