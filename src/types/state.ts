/**
 * 状态管理相关的类型定义
 */

/** 状态观察者回调 */
export type StateObserver<T = any> = (newValue: T, oldValue?: T) => void;

/** 状态变化事件 */
export interface StateChangeEvent<T = any> {
  /** 旧值 */
  oldValue: T;
  /** 新值 */
  newValue: T;
  /** 属性名称 */
  property: string;
  /** 时间戳 */
  timestamp: number;
}

/** 计算属性的获取器 */
export type ComputedGetter<T = any> = () => T;

/** 计算属性配置 */
export interface ComputedOptions<T = any> {
  /** 获取函数 */
  get: ComputedGetter<T>;
  /** 设置函数（可选） */
  set?: (value: T) => void;
}

/** 状态订阅函数 */
export type StateSubscription = () => void;

/** 状态验证器 */
export type StateValidator<T = any> = (value: T) => boolean | string;

/** 响应式配置 */
export interface ReactiveOptions {
  /** 是否深度监听 */
  deep?: boolean;
  /** 验证器 */
  validator?: StateValidator;
  /** 变化时的回调 */
  onChange?: StateObserver;
}

