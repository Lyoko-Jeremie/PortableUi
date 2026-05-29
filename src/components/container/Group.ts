/**
 * 分组容器
 * 用于组织相关元素，提供标题和视觉分組效果
 */

import {Container, ContainerProps} from './Container';
import {ComponentElement, ComponentProps} from '../../types';
import {LayoutConfig} from '../../layout';
import {LayoutEngine} from '../../layout/LayoutEngine';
import {applyCommonElementProps} from '../basic/internal';
import {BaseComponent} from '../../core';

export interface GroupProps extends ContainerProps {
  /** 分组标题 */
  title?: string;
  /** 标题位置 */
  titlePosition?: 'top' | 'left';
  /** 是否显示边框 */
  bordered?: boolean;
  /** 边框颜色 */
  borderColor?: string;
  /** 边框宽度 */
  borderWidth?: string | number;
  /** 边框样式 */
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  /** 圆角大小 */
  borderRadius?: string | number;
  /** 背景色 */
  backgroundColor?: string;
}

export class Group extends Container {
  constructor(props: GroupProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as GroupProps;
    const groupWrapper = document.createElement('div');

    applyCommonElementProps(groupWrapper, props, 'portableui-group');

    // 构建分组容器的外层样式
    const wrapperStyles: Record<string, string | number> = {
      display: 'flex',
      flexDirection: props.titlePosition === 'left' ? 'row' : 'column',
      gap: '8px',
    };

    if (props.width) {
      wrapperStyles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }

    const wrapperStyleStr = Object.entries(wrapperStyles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');

    groupWrapper.setAttribute('style', wrapperStyleStr);

    // 如果有标题，添加标题元素
    if (props.title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'portableui-group-title';
      const titleStyles: Record<string, string | number> = {
        fontWeight: 'bold',
        fontSize: '14px',
        marginBottom: props.titlePosition === 'left' ? '0' : '8px',
        marginRight: props.titlePosition === 'left' ? '8px' : '0',
        whiteSpace: 'nowrap',
        flex: props.titlePosition === 'left' ? '0 0 auto' : '1 1 auto',
      };

      const titleStyleStr = Object.entries(titleStyles)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value};`;
        })
        .join(' ');

      titleElement.setAttribute('style', titleStyleStr);
      titleElement.textContent = props.title;
      groupWrapper.appendChild(titleElement);
    }

    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'portableui-group-content';

    // 构建内容容器的样式
    const contentConfig: LayoutConfig = {
      direction: (props.direction === 'vertical' ? 'vertical' : 'horizontal') as any,
      ...(props.justifyContent && {justifyContent: props.justifyContent}),
      ...(props.alignItems && {alignItems: props.alignItems}),
      ...(props.gap !== undefined && {gap: props.gap}),
      ...(props.padding !== undefined && {padding: props.padding}),
      wrap: props.wrap ?? false,
    };

    const contentLayoutStyles = LayoutEngine.createLayoutWrapper(contentConfig);

    // 应用边框和背景样式
    const contentStyles: Record<string, string | number> = {};

    if (props.bordered !== false) {
      contentStyles.border = `${props.borderWidth ?? 1}px ${props.borderStyle ?? 'solid'} ${props.borderColor ?? '#ccc'}`;
    }

    if (props.borderRadius) {
      contentStyles.borderRadius = typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius;
    }

    if (props.backgroundColor) {
      contentStyles.backgroundColor = props.backgroundColor;
    }

    if (props.height) {
      contentStyles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }

    if (props.minHeight) {
      contentStyles.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight;
    }

    const contentStyleStr = Object.entries(contentStyles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');

    const finalContentStyle = [contentLayoutStyles, contentStyleStr].filter(Boolean).join(' ');
    contentContainer.setAttribute('style', finalContentStyle);

    // 添加子元素到内容容器
    this.renderChildrenInGroup(contentContainer);

    // 添加内容容器到分组包装器
    groupWrapper.appendChild(contentContainer);

    return groupWrapper;
  }

  /**
   * 在 Group 容器中渲染子元素
   */
  private renderChildrenInGroup(container: HTMLElement): void {
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






