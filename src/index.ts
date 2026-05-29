/**
 * PortableUi - 便携式 UI 库
 * 为 Web 环境快速创建用户界面
 *
 * 主要特性：
 * - 易用的 API 设计
 * - 完整的国际化支持
 * - 样式隔离（Shadow DOM）
 * - 响应式设计
 * - 模块化组件
 * - 轻量级库体积
 */

// 核心系统
export * from './core';

// 类型系统
export * from './types';

// 样式系统
export * from './styles';

// 工具函数
export * from './utils';

// 布局系统
export * from './layout';

// 国际化系统
export * from './i18n';

// 组件库
export * from './components/basic';
export * from './components/complex';
export * from './components/container';

// 版本信息
export const version = '0.1.0';

// 库初始化函数
export function initialize(): void {
  console.log('PortableUi initialized');
}

