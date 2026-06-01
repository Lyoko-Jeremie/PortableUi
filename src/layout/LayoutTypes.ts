/**
 * 布局系统类型定义
 */

/** 布局方向 */
export type LayoutDirection = 'horizontal' | 'vertical' | 'grid';

/** 对齐方式 */
export type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';

/** 布局配置 */
export interface LayoutConfig {
  /** 布局方向 */
  direction?: LayoutDirection;
  /** 主轴对齐 */
  justifyContent?: Alignment;
  /** 交叉轴对齐 */
  alignItems?: Alignment;
  /** 间距 */
  gap?: string | number;
  /** 填充 */
  padding?: string | number;
  /** 外边距 */
  margin?: string | number;
  /** 是否换行 */
  wrap?: boolean;
}

/** 网格配置 */
export interface GridConfig extends LayoutConfig {
  /** 列数 */
  columns?: number;
  /** 行数 */
  rows?: number;
  /** 列间距 */
  columnGap?: string | number;
  /** 行间距 */
  rowGap?: string | number;
}

/** 网格项目配置 */
export interface GridItemConfig {
  /** 列跨度 */
  columnSpan?: number;
  /** 行跨度 */
  rowSpan?: number;
}

/** 弹性布局配置 */
export interface FlexConfig extends LayoutConfig {
  /** 伸展系数 */
  grow?: number;
  /** 收缩系数 */
  shrink?: number;
  /** 基础尺寸 */
  basis?: string | number;
}

/** 单位 */
export type Unit = 'px' | 'em' | 'rem' | '%' | 'auto';

/** 尺寸值 */
export type SizeValue = string | number | 'auto' | 'fit-content' | 'max-content';
