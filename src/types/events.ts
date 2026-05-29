/**
 * 事件系统相关的类型定义
 */

/** 事件类型 */
export interface PortableEvent {
  /** 事件类型 */
  type: string;
  /** 事件数据 */
  data?: any;
  /** 是否冒泡 */
  bubbles?: boolean;
  /** 是否可被取消 */
  cancelable?: boolean;
  /** 源组件 ID */
  sourceId?: string;
}

/** 事件监听回调 */
export type EventListener = (event: PortableEvent) => void;

/** 事件监听选项 */
export interface EventListenerOptions {
  /** 是否捕获阶段监听 */
  capture?: boolean;
  /** 是否仅触发一次 */
  once?: boolean;
  /** 事件优先级 */
  priority?: number;
}

/** 事件映射表 */
export interface EventMap {
  [eventName: string]: any;
}

/** 事件触发参数 */
export interface EventEmitOptions {
  /** 是否冒泡 */
  bubbles?: boolean;
  /** 是否可被取消 */
  cancelable?: boolean;
  /** 额外数据 */
  detail?: any;
}


