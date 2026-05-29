/**
 * 主题和设计令牌
 */

import { Theme, ColorScheme } from './types';

/** 默认颜色方案 */
export const defaultColors: ColorScheme = {
  primary: '#007bff',
  secondary: '#6c757d',
  background: '#ffffff',
  text: '#212529',
  border: '#dee2e6',
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
};

/** 默认尺寸定义 */
export const defaultSizes = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

/** 默认间距定义 */
export const defaultSpacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
};

/** 默认字体定义 */
export const defaultFonts = {
  base: 'system-ui, -apple-system, sans-serif',
  mono: 'Menlo, Monaco, monospace',
  heading: 'system-ui, -apple-system, sans-serif',
};

/** 轻色主题 */
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    ...defaultColors,
    background: '#ffffff',
    text: '#212529',
  },
  sizes: defaultSizes,
  spacing: defaultSpacing,
  fonts: defaultFonts,
};

/** 深色主题 */
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    ...defaultColors,
    background: '#1e1e1e',
    text: '#f0f0f0',
    border: '#404040',
  },
  sizes: defaultSizes,
  spacing: defaultSpacing,
  fonts: defaultFonts,
};

/** 获取默认主题 */
export function getDefaultTheme(): Theme {
  // 检测系统主题偏好
  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return darkTheme;
  }
  return lightTheme;
}

