/**
 * 弹性布局容器
 * 基于 Flexbox 的灵活布局容器
 */

import {Container, ContainerProps} from './Container';
import {ComponentElement} from '../../types';
import {FlexConfig} from '../../layout';
import {LayoutEngine} from '../../layout/LayoutEngine';
import {applyCommonElementProps} from '../basic/internal';
import {BaseComponent} from '../../core';
import {registerContainerComponentCtors} from './imperative';

export interface FlexProps extends ContainerProps {
  /** 弹性伸展系数 */
  grow?: number;
  /** 弹性收缩系数 */
  shrink?: number;
  /** 基础尺寸 */
  basis?: string | number;
  /** 是否为内联 flex */
  inline?: boolean;
}

export class Flex extends Container<FlexProps> {
  constructor(props: FlexProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as FlexProps;
    const flex = document.createElement('div');

    // 应用通用属性
    applyCommonElementProps(flex, props, 'portableui-flex');

    // 构建布局配置
    const layoutConfig: FlexConfig = {
      direction: props.direction === 'vertical' ? 'vertical' : 'horizontal',
      ...(props.justifyContent && {justifyContent: props.justifyContent}),
      ...(props.alignItems && {alignItems: props.alignItems}),
      ...(props.gap !== undefined && {gap: props.gap}),
      ...(props.padding !== undefined && {padding: props.padding}),
      ...(props.margin !== undefined && {margin: props.margin}),
      wrap: props.wrap ?? false,
      grow: props.grow ?? 1,
      shrink: props.shrink ?? 1,
      basis: props.basis ?? 'auto',
    };

    // 应用布局样式
    const layoutStyles = LayoutEngine.createLayoutWrapper(layoutConfig);

    // 构建完整的样式
    const flexItemStyles = LayoutEngine.createFlexItemLayout(layoutConfig);

    // 合并所有样式
    const allStyles = layoutStyles + ' ' +
      Object.entries(flexItemStyles)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value};`;
        })
        .join(' ');

    // 应用额外样式
    const extraStyles: Record<string, string | number> = {};
    if (props.inline) {
      extraStyles.display = 'inline-flex';
    }
    if (props.backgroundColor) {
      extraStyles.backgroundColor = props.backgroundColor;
    }
    if (props.width) {
      extraStyles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
    if (props.height) {
      extraStyles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
    if (props.minHeight) {
      extraStyles.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight;
    }

    const extraStyleStr = Object.entries(extraStyles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');

    const finalStyle = [allStyles, extraStyleStr].filter(Boolean).join(' ');
    flex.setAttribute('style', finalStyle);

    // 添加子元素
    this.renderChildrenInFlex(flex);

    return flex;
  }

  /**
   * 在 Flex 容器中渲染子元素
   */
  private renderChildrenInFlex(container: HTMLElement): void {
    const children = this.getContainerChildren();
    for (const child of children) {
      if (child instanceof BaseComponent) {
        const childElement = child.getElement();
        if (childElement) {
          container.appendChild(childElement);
        } else {
          // 如果未挂载，创建临时容器
          const childContainer = document.createElement('div');
          child.mount(childContainer);
          if (childContainer.firstChild) {
            container.appendChild(childContainer.firstChild);
          }
        }
      } else if (child instanceof HTMLElement) {
        container.appendChild(child);
      }
    }
  }
}

registerContainerComponentCtors({Flex});





