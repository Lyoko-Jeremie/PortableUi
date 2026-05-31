import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface HtmlLabelProps extends ComponentProps {
  html?: string;
  htmlFor?: string;
}

export class HtmlLabel extends BaseComponent {
  constructor(props: HtmlLabelProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as HtmlLabelProps;
    const label = document.createElement('label');

    applyCommonElementProps(label, props, 'portableui-html-label');
    label.innerHTML = props.html ?? '';

    if (props.htmlFor) {
      label.htmlFor = props.htmlFor;
    }

    return label;
  }

  setHtml(html: string): void {
    this.update({html});
  }
}

