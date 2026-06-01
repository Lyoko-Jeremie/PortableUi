/**
 * 布局引擎
 */

import {LayoutConfig, GridConfig, GridItemConfig, FlexConfig} from './LayoutTypes';
import {CSS} from '../styles';

export class LayoutEngine {
  /**
   * 创建水平布局样式
   */
  static createHorizontalLayout(config: LayoutConfig): Record<string, string | number> {
    return {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: this.mapAlignment(config.justifyContent),
      alignItems: this.mapAlignment(config.alignItems),
      gap: this.formatSize(config.gap),
      padding: this.formatSize(config.padding),
      margin: this.formatSize(config.margin),
      flexWrap: config.wrap ? 'wrap' : 'nowrap',
    };
  }

  /**
   * 创建垂直布局样式
   */
  static createVerticalLayout(config: LayoutConfig): Record<string, string | number> {
    return {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: this.mapAlignment(config.justifyContent),
      alignItems: this.mapAlignment(config.alignItems),
      gap: this.formatSize(config.gap),
      padding: this.formatSize(config.padding),
      margin: this.formatSize(config.margin),
      flexWrap: config.wrap ? 'wrap' : 'nowrap',
    };
  }

  /**
   * 创建网格布局样式
   */
  static createGridLayout(config: GridConfig): Record<string, string | number> {
    const gridTemplateColumns = config.columns ? `repeat(${config.columns}, 1fr)` : 'auto';
    const gridTemplateRows = config.rows ? `repeat(${config.rows}, 1fr)` : 'auto';

    return {
      display: 'grid',
      gridTemplateColumns,
      gridTemplateRows,
      gap: this.formatSize(config.gap),
      columnGap: this.formatSize(config.columnGap),
      rowGap: this.formatSize(config.rowGap),
      padding: this.formatSize(config.padding),
      margin: this.formatSize(config.margin),
      justifyContent: this.mapAlignment(config.justifyContent),
      alignItems: this.mapAlignment(config.alignItems),
    };
  }

  /**
   * 创建网格项目样式
   */
  static createGridItemLayout(config: GridItemConfig): Record<string, string | number> {
    return {
      gridColumn: config.columnSpan ? `span ${config.columnSpan}` : 'auto',
      gridRow: config.rowSpan ? `span ${config.rowSpan}` : 'auto',
    };
  }

  /**
   * 创建弹性布局项目样式
   */
  static createFlexItemLayout(config: FlexConfig): Record<string, string | number> {
    return {
      flex: `${config.grow || 0} ${config.shrink || 1} ${this.formatSize(config.basis)}`,
    };
  }

  /**
   * 创建完整的布局包装器样式
   */
  static createLayoutWrapper(config: LayoutConfig): string {
    const layoutStyles =
      config.direction === 'grid'
        ? this.createGridLayout(config as GridConfig)
        : config.direction === 'vertical'
          ? this.createVerticalLayout(config)
          : this.createHorizontalLayout(config);

    return CSS.stringify(layoutStyles);
  }

  /**
   * 格式化尺寸值
   */
  private static formatSize(size?: string | number): string | number {
    if (size === undefined || size === null) {
      return 0;
    }

    if (typeof size === 'string') {
      return size;
    }

    return `${size}px`;
  }

  /**
   * 映射对齐值到 CSS 值
   */
  private static mapAlignment(alignment?: string): string {
    switch (alignment) {
      case 'start':
        return 'flex-start';
      case 'end':
        return 'flex-end';
      case 'center':
        return 'center';
      case 'stretch':
        return 'stretch';
      case 'space-between':
        return 'space-between';
      case 'space-around':
        return 'space-around';
      default:
        return 'auto';
    }
  }

  /**
   * 生成带有响应式的布局样式
   */
  static createResponsiveLayout(
    baseConfig: LayoutConfig,
    breakpoints: Record<string, Partial<LayoutConfig>>
  ): string {
    let css = this.createLayoutWrapper(baseConfig);

    for (const [breakpoint, config] of Object.entries(breakpoints)) {
      const mergedConfig = {...baseConfig, ...config};
      const breakpointCss = this.createLayoutWrapper(mergedConfig);

      // 简单的断点处理（实际应用中应该使用真实的媒体查询）
      css += `\n@media (min-width: ${breakpoint}) { ${breakpointCss} }`;
    }

    return css;
  }
}
