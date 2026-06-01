/**
 * 网格布局容器
 * 基于 CSS Grid 的强大网格布局
 */

import {Container, ContainerProps} from './Container';
import {ComponentElement, ComponentProps} from '../../types';
import {GridConfig, GridItemConfig} from '../../layout';
import {LayoutEngine} from '../../layout/LayoutEngine';
import {applyCommonElementProps} from '../basic/internal';
import {BaseComponent} from '../../core';
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

export interface GridProps extends ContainerProps {
  /** 列数 */
  columns?: number;
  /** 行数 */
  rows?: number;
  /** 列间距 */
  columnGap?: string | number;
  /** 行间距 */
  rowGap?: string | number;
  /** 自动行高 */
  autoRows?: string | number;
  /** 自动列宽 */
  autoColumns?: string | number;
}

export interface GridItemProps extends ComponentProps {
  /** 列跨度 */
  columnSpan?: number;
  /** 行跨度 */
  rowSpan?: number;
  /** 子元素 */
  children?: (BaseComponent | HTMLElement)[];
}

export class GridItem extends BaseComponent implements NestedAddMountTarget {
  // Lazily initialized imperative namespace, bound to this grid item instance.
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

  constructor(props: GridItemProps = {}) {
    super(props);
    this.children = props.children ?? [];
  }

  protected render(): ComponentElement {
    const props = this.props as GridItemProps;
    const item = document.createElement('div');

    applyCommonElementProps(item, props, 'portableui-grid-item');

    // 构建网格项目样式
    const itemConfig: GridItemConfig = {
      ...(props.columnSpan && {columnSpan: props.columnSpan}),
      ...(props.rowSpan && {rowSpan: props.rowSpan}),
    };

    const itemStyles = LayoutEngine.createGridItemLayout(itemConfig);
    const styleStr = Object.entries(itemStyles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');

    if (styleStr) {
      item.setAttribute('style', styleStr);
    }

    this.renderChildren(item);

    return item;
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
   * 获取所有子元素
   */
  getChildrenList(): (BaseComponent | HTMLElement)[] {
    return [...this.children];
  }

  private renderChildren(container: HTMLElement): void {
    for (const child of this.children) {
      if (child instanceof BaseComponent) {
        const childElement = child.getElement();
        if (childElement) {
          container.appendChild(childElement);
        } else {
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
}

export interface GridItem extends BuiltInContainerWithNestedAddMethods {}

export class Grid extends Container<GridProps> {
  constructor(props: GridProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as GridProps;
    const grid = document.createElement('div');

    applyCommonElementProps(grid, props, 'portableui-grid');

    // 构建网格布局配置
    const gridConfig: GridConfig = {
      direction: 'grid',
      columns: props.columns ?? 1,
      ...(props.rows && {rows: props.rows}),
      ...(props.columnGap !== undefined && {columnGap: props.columnGap ?? props.gap}),
      ...(props.rowGap !== undefined && {rowGap: props.rowGap ?? props.gap}),
      ...(props.gap !== undefined && {gap: props.gap}),
      ...(props.padding !== undefined && {padding: props.padding}),
      ...(props.margin !== undefined && {margin: props.margin}),
      ...(props.justifyContent && {justifyContent: props.justifyContent}),
      ...(props.alignItems && {alignItems: props.alignItems}),
    };

    // 应用布局样式
    const layoutStyles = LayoutEngine.createLayoutWrapper(gridConfig);

    // 应用额外样式
    const extraStyles: Record<string, string | number> = {};
    if (props.autoRows) {
      extraStyles.gridAutoRows = typeof props.autoRows === 'number' ? `${props.autoRows}px` : props.autoRows;
    }
    if (props.autoColumns) {
      extraStyles.gridAutoColumns = typeof props.autoColumns === 'number' ? `${props.autoColumns}px` : props.autoColumns;
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

    const finalStyle = [layoutStyles, extraStyleStr].filter(Boolean).join(' ');
    grid.setAttribute('style', finalStyle);

    // 添加子元素
    this.renderChildrenInGrid(grid);

    return grid;
  }

  /**
   * 在 Grid 容器中渲染子元素
   */
  private renderChildrenInGrid(container: HTMLElement): void {
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

  /**
   * 创建网格项目
   */
  static createItem(props?: GridItemProps): GridItem {
    return new GridItem(props);
  }
}

registerContainerComponentCtors({Grid, GridItem});
