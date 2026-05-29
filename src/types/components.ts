/**
 * 组件相关的类型定义
 */

import type {BaseComponent} from '../core/BaseComponent';

/** 组件属性基类 */
export interface ComponentProps {
  /** 组件唯一标识 */
  id?: string;
  /** CSS 类名 */
  className?: string;
  /** 内联样式 */
  style?: Record<string, string>;

  /** 数据属性 */
  [key: string]: any;
}

/** 组件状态 */
export type ComponentState = Record<string, any>;

/** 组件配置 */
export interface ComponentConfig extends ComponentProps {
  /** 组件类型 */
  type?: string;
}

/** 组件生命周期回调 */
export interface ComponentLifecycle {
  onMount?: (self: BaseComponent) => void;
  onUpdate?: (self: BaseComponent) => void;
  onUnmount?: (self: BaseComponent) => void;
  onError?: (self: BaseComponent, error: Error) => void;
}

/** DOM 元素 */
export type ComponentElement = HTMLElement | null;

/** 生命周期方法类型 */
export type LifecycleMethod = 'mount' | 'update' | 'unmount';

