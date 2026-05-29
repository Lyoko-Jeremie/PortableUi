/**
 * 样式系统类型定义
 */

/** 样式对象 */
export type StyleObject = Record<string, string | number>;

/** 主题配置 */
export interface Theme {
  /** 主题名称 */
  name: string;
  /** 颜色方案 */
  colors?: ColorScheme;
  /** 尺寸定义 */
  sizes?: Record<string, string | number>;
  /** 间距定义 */
  spacing?: Record<string, string | number>;
  /** 字体定义 */
  fonts?: Record<string, string>;

  /** 其他自定义属性 */
  [key: string]: any;
}

/** 颜色方案 */
export interface ColorScheme {
  /** 主色调 */
  primary?: string;
  /** 次色调 */
  secondary?: string;
  /** 背景色 */
  background?: string;
  /** 文字色 */
  text?: string;
  /** 边框色 */
  border?: string;
  /** 成功色 */
  success?: string;
  /** 警告色 */
  warning?: string;
  /** 错误色 */
  error?: string;

  /** 其他颜色 */
  [key: string]: string | undefined;
}

/** 样式管理选项 */
export interface StyleManagerOptions {
  /** 是否使用 Shadow DOM 隔离 */
  isolate?: boolean;
  /** 主题配置 */
  theme?: Theme;
  /** 前缀 */
  prefix?: string;
}

/** CSS 规则 */
export interface CSSRule {
  /** 选择器 */
  selector: string;
  /** 声明 */
  declarations: Record<string, string | number>;
}

/** 媒体查询 */
export interface MediaQuery {
  /** 查询条件 */
  condition: string;
  /** CSS 规则 */
  rules: CSSRule[];
}

