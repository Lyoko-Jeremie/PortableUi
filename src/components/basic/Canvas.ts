import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface CanvasProps extends ComponentProps {
  width?: number;
  height?: number;
  contextType?: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer';
  contextAttributes?: Record<string, any>;
  onReady?: (self: Canvas, context: RenderingContext | null, canvas: HTMLCanvasElement) => void;
  onDraw?: (self: Canvas, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
  onClick?: (self: Canvas, event: MouseEvent) => void;
}

export class Canvas extends BaseComponent {
  constructor(props: CanvasProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as CanvasProps;
    const canvas = document.createElement('canvas');

    applyCommonElementProps(canvas, props, 'portableui-canvas');

    canvas.width = props.width ?? 300;
    canvas.height = props.height ?? 150;

    if (props.onClick) {
      canvas.addEventListener('click', (event) => {
        props.onClick?.(this, event as MouseEvent);
      });
    }

    const contextType = props.contextType ?? '2d';
    const context = canvas.getContext(contextType, props.contextAttributes as any);

    props.onReady?.(this, context, canvas);

    if (contextType === '2d' && context) {
      props.onDraw?.(this, context as CanvasRenderingContext2D, canvas);
    }

    return canvas;
  }

  getCanvasElement(): HTMLCanvasElement | null {
    return this.element as HTMLCanvasElement | null;
  }

  getContext(
    contextType: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer' = '2d',
    options?: Record<string, any>
  ): RenderingContext | null {
    const canvas = this.getCanvasElement();
    return canvas?.getContext(contextType, options as any) ?? null;
  }

  clear(): void {
    const canvas = this.getCanvasElement();
    const context = this.getContext('2d') as CanvasRenderingContext2D | null;

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  setSize(width: number, height: number): void {
    this.update({width, height});
  }

  toDataURL(type?: string, quality?: number): string {
    const canvas = this.getCanvasElement();
    return canvas ? canvas.toDataURL(type, quality) : '';
  }
}

