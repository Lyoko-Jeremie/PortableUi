/**
 * 基础容器组件
 * 提供基本的布局容器功能，作为其他布局容器的基础
 */

import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {LayoutConfig} from '../../layout';
import {LayoutEngine} from '../../layout/LayoutEngine';
import {applyCommonElementProps} from '../basic/internal';
import {
  BuiltInContainerWithNestedAddMethods,
  ComponentPropsOf,
  AnyComponentCtor,
  AddMountComponentFn,
  NestedAddMountTarget,
  createContainerAddObject,
  registerContainerComponentCtors, ContainerAddObject,
  stripBindProp,
} from './imperative';

export interface ContainerProps extends ComponentProps {
  /** 容器方向 */
  direction?: 'horizontal' | 'vertical';
  /** 主轴对齐方式 */
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';
  /** 交叉轴对齐方式 */
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  /** 间距 */
  gap?: string | number;
  /** 填充 */
  padding?: string | number;
  /** 外边距 */
  margin?: string | number;
  /** 背景色 */
  backgroundColor?: string;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 最小高度 */
  minHeight?: string | number;
  /** 是否换行 */
  wrap?: boolean;
  /** 子元素 */
  children?: (BaseComponent | HTMLElement)[];
}

export class Container extends BaseComponent implements NestedAddMountTarget {
  // Lazily initialized imperative namespace, bound to this container instance.
  private addNamespace?: ContainerAddObject;

  get add(): ContainerAddObject {
    if (!this.addNamespace) {
      this.addNamespace = createContainerAddObject((ctor, props) => this.createAndAddChild(ctor, props));
    }

    return this.addNamespace;
  }

  setAddMountComponent(mountComponent: AddMountComponentFn): void {
    if (!this.addNamespace) {
      this.addNamespace = createContainerAddObject(mountComponent);
      return;
    }

    this.addNamespace.setMountComponent(mountComponent);
  }

  /** 子组件集合 */
  private children: (BaseComponent | HTMLElement)[] = [];

  constructor(props: ContainerProps = {}) {
    super(props);
    this.children = props.children || [];
  }


  /**
   * 创建并追加子组件，供 add* 快捷方法复用
   */
  protected createAndAddChild<TCtor extends AnyComponentCtor>(
    ctor: TCtor,
    props: ComponentPropsOf<TCtor>
  ): InstanceType<TCtor> {
    const instance = new ctor(stripBindProp(props));
    this.addChild(instance);
    return instance as InstanceType<TCtor>;
  }

  protected render(): ComponentElement {
    const props = this.props as ContainerProps;
    const container = document.createElement('div');

    applyCommonElementProps(container, props, 'portableui-container');

    // 构建布局配置
    const layoutConfig: LayoutConfig = {
      direction: props.direction === 'vertical' ? 'vertical' : 'horizontal',
      ...(props.justifyContent && {justifyContent: props.justifyContent}),
      ...(props.alignItems && {alignItems: props.alignItems}),
      ...(props.gap !== undefined && {gap: props.gap}),
      ...(props.padding !== undefined && {padding: props.padding}),
      ...(props.margin !== undefined && {margin: props.margin}),
      wrap: props.wrap ?? false,
    };

    // 应用布局样式
    const layoutStyles = LayoutEngine.createLayoutWrapper(layoutConfig);
    container.setAttribute('style', layoutStyles);

    // 应用额外样式
    const extraStyles: Record<string, string | number> = {};
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

    if (extraStyleStr) {
      const existingStyle = container.getAttribute('style') || '';
      container.setAttribute('style', existingStyle + ' ' + extraStyleStr);
    }

    // 添加子元素
    this.renderChildren(container);

    return container;
  }

  /**
   * 渲染子元素
   */
  private renderChildren(container: HTMLElement): void {
    for (const child of this.children) {
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

  /**
   * 添加子元素
   */
  addChild(child: BaseComponent | HTMLElement): void {
    this.children.push(child);
    if (this.mounted && this.element) {
      this.rerender();
    }
  }

  /**
   * 移除容器子元素
   */
  removeContainerChild(child: BaseComponent | HTMLElement): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      if (this.mounted && this.element) {
        this.rerender();
      }
    }
  }

  /**
   * 清空所有子元素
   */
  clearChildren(): void {
    this.children = [];
    if (this.mounted && this.element) {
      this.element.innerHTML = '';
    }
  }

  /**
   * 获取所有容器子元素
   */
  getContainerChildren(): (BaseComponent | HTMLElement)[] {
    return [...this.children];
  }

  /**
   * 设置子元素
   */
  setChildren(children: (BaseComponent | HTMLElement)[]): void {
    this.children = children;
    if (this.mounted && this.element) {
      this.rerender();
    }
  }
}

registerContainerComponentCtors({Container});

export interface Container extends BuiltInContainerWithNestedAddMethods {}
