import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export type NativeHtmlContent = string | HTMLElement | DocumentFragment;

export interface HtmlContainerProps extends ComponentProps {
  /** Raw HTML content or native DOM node */
  html?: NativeHtmlContent;
}

export class HtmlContainer extends BaseComponent {
  constructor(props: HtmlContainerProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as HtmlContainerProps;
    const container = document.createElement('div');

    applyCommonElementProps(container, props, 'portableui-html-container');
    this.applyContent(container, props.html);

    return container;
  }

  private applyContent(container: HTMLElement, html?: NativeHtmlContent): void {
    if (html === undefined || html === null) {
      return;
    }

    if (typeof html === 'string') {
      container.innerHTML = html;
      return;
    }

    if (html instanceof HTMLElement || html instanceof DocumentFragment) {
      container.appendChild(html);
    }
  }

  setHtmlContent(html: NativeHtmlContent): void {
    this.update({html} as Partial<ComponentProps>);
  }

  clearHtmlContent(): void {
    this.update({html: ''} as Partial<ComponentProps>);
  }
}

