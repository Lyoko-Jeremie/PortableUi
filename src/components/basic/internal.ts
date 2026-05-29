import {ComponentProps} from '../../types';

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

  if (props.style) {
    Object.assign(element.style, props.style);
  }
}

