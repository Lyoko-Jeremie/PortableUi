import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface ImageProps extends ComponentProps {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'eager' | 'lazy';
  decoding?: 'sync' | 'async' | 'auto';
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  referrerPolicy?: ReferrerPolicy;
  onLoad?: (self: Image, event: Event) => void;
  onError?: (self: Image, event: Event) => void;
}

export class Image extends BaseComponent {
  constructor(props: ImageProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ImageProps;
    const image = document.createElement('img');

    applyCommonElementProps(image, props, 'portableui-image');

    image.src = props.src ?? '';
    image.alt = props.alt ?? '';

    if (typeof props.width === 'number') {
      image.width = props.width;
    } else if (typeof props.width === 'string') {
      image.setAttribute('width', props.width);
    }

    if (typeof props.height === 'number') {
      image.height = props.height;
    } else if (typeof props.height === 'string') {
      image.setAttribute('height', props.height);
    }

    if (props.loading) {
      image.loading = props.loading;
    }

    if (props.decoding) {
      image.decoding = props.decoding;
    }

    if (props.crossOrigin !== undefined) {
      image.crossOrigin = props.crossOrigin;
    }

    if (props.referrerPolicy) {
      image.referrerPolicy = props.referrerPolicy;
    }

    image.addEventListener('load', (event) => {
      props.onLoad?.(this, event);
    });

    image.addEventListener('error', (event) => {
      props.onError?.(this, event);
    });

    return image;
  }

  getSrc(): string {
    const image = this.element as HTMLImageElement | null;
    return image?.getAttribute('src') ?? '';
  }

  setSrc(src: string): void {
    this.update({src});
  }

  setAlt(alt: string): void {
    this.update({alt});
  }
}

