import {ComponentProps} from '../../types';

function toCssSize(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * 为基础组件应用通用属性（id、className、style）
 */
export function applyCommonElementProps(
  element: HTMLElement,
  props: ComponentProps,
  defaultClassName: string
): void {
  if (props.id) {
    element.id = props.id;
  }

  const className = [defaultClassName, props.className ?? ''].filter(Boolean).join(' ');
  if (className) {
    element.className = className;
  }

  if (props.margin !== undefined) {
    element.style.margin = toCssSize(props.margin);
  }
  if (props.padding !== undefined) {
    element.style.padding = toCssSize(props.padding);
  }
  if (props.width !== undefined) {
    element.style.width = toCssSize(props.width);
  }
  if (props.height !== undefined) {
    element.style.height = toCssSize(props.height);
  }
  if (props.backgroundColor !== undefined) {
    element.style.backgroundColor = props.backgroundColor;
  }

  if (props.style) {
    Object.assign(element.style, props.style);
  }
}

