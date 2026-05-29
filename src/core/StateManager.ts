/**
 * 状态管理系统
 * 基于 alien-signals 的响应式状态管理
 */

import { StateObserver, StateChangeEvent, ComputedOptions, ReactiveOptions, StateValidator } from '../types';

export class StateManager {
  /** 响应式状态对象 */
  private state: Record<string, any> = {};

  /** 观察者映射 */
  private observers: Map<string, Set<StateObserver>> = new Map();

  /** 计算属性缓存 */
  private computed: Map<string, any> = new Map();

  /** 验证器映射 */
  private validators: Map<string, StateValidator> = new Map();

  /** 状态变化历史 */
  private history: StateChangeEvent[] = [];

  /** 最大历史记录数 */
  private maxHistory: number = 50;

  /**
   * 创建响应式状态
   * @param key - 状态键
   * @param initialValue - 初始值
   * @param options - 配置选项
   */
  createReactive<T = any>(
    key: string,
    initialValue: T,
    options?: ReactiveOptions
  ): T {
    if (this.state.hasOwnProperty(key)) {
      console.warn(`State key "${key}" already exists`);
      return this.state[key];
    }

    // 设置验证器
    if (options?.validator) {
      this.validators.set(key, options.validator);
    }

    // 初始化状态
    this.state[key] = initialValue;
    this.observers.set(key, new Set());

    return this.state[key];
  }

  /**
   * 获取状态值
   * @param key - 状态键
   */
  get<T = any>(key: string): T {
    return this.state[key] as T;
  }

  /**
   * 设置状态值
   * @param key - 状态键
   * @param value - 新值
   */
  set<T = any>(key: string, value: T): void {
    if (!this.state.hasOwnProperty(key)) {
      console.warn(`State key "${key}" does not exist`, 'Use createReactive() first');
      return;
    }

    // 验证值
    const validator = this.validators.get(key);
    if (validator) {
      const result = validator(value);
      if (result !== true) {
        console.error(`Validation failed for state "${key}": ${result}`);
        return;
      }
    }

    const oldValue = this.state[key];

    // 避免无用更新
    if (Object.is(oldValue, value)) {
      return;
    }

    this.state[key] = value;

    // 记录变化事件
    const event: StateChangeEvent = {
      oldValue,
      newValue: value,
      property: key,
      timestamp: Date.now(),
    };
    this.addToHistory(event);

    // 通知观察者
    this.notifyObservers(key, value, oldValue);
  }

  /**
   * 注册状态观察者
   * @param key - 状态键
   * @param observer - 观察者回调
   */
  observe<T = any>(key: string, observer: StateObserver<T>): () => void {
    if (!this.state.hasOwnProperty(key)) {
      console.warn(`State key "${key}" does not exist`);
      return () => {};
    }

    if (!this.observers.has(key)) {
      this.observers.set(key, new Set());
    }

    this.observers.get(key)!.add(observer);

    // 返回取消观察的函数
    return () => {
      this.observers.get(key)?.delete(observer);
    };
  }

  /**
   * 创建计算属性
   * @param key - 属性键
   * @param options - 计算选项
   */
  createComputed<T = any>(key: string, options: ComputedOptions<T>): T {
    if (this.computed.has(key)) {
      console.warn(`Computed property "${key}" already exists`);
      return this.computed.get(key);
    }

    // 初始化计算属性
    const value = options.get();
    this.computed.set(key, value);

    return value;
  }

  /**
   * 获取计算属性值
   * @param key - 属性键
   */
  getComputed<T = any>(key: string): T {
    return this.computed.get(key) as T;
  }

  /**
   * 批量更新状态
   * @param updates - 状态更新对象
   */
  batch(updates: Record<string, any>): void {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value);
    }
  }

  /**
   * 获取所有状态
   */
  getAll(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * 重置状态为初始值
   * @param key - 状态键
   * @param initialValue - 初始值
   */
  reset(key: string, initialValue: any): void {
    if (this.state.hasOwnProperty(key)) {
      this.set(key, initialValue);
    }
  }

  /**
   * 获取状态变化历史
   * @param key - 可选的状态键
   */
  getHistory(key?: string): StateChangeEvent[] {
    if (key) {
      return this.history.filter((event) => event.property === key);
    }
    return [...this.history];
  }

  /**
   * 清除状态变化历史
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 删除状态
   * @param key - 状态键
   */
  delete(key: string): void {
    if (!this.state.hasOwnProperty(key)) {
      return;
    }

    delete this.state[key];
    this.observers.delete(key);
    this.validators.delete(key);
  }

  /**
   * 清空所有状态
   */
  clear(): void {
    this.state = {};
    this.observers.clear();
    this.validators.clear();
    this.computed.clear();
    this.history = [];
  }

  /**
   * 通知观察者
   */
  private notifyObservers<T = any>(key: string, newValue: T, oldValue: T): void {
    const observers = this.observers.get(key);
    if (!observers) {
      return;
    }

    for (const observer of observers) {
      try {
        observer(newValue, oldValue);
      } catch (error) {
        console.error(`Error in observer for state "${key}":`, error);
      }
    }
  }

  /**
   * 向历史记录中添加事件
   */
  private addToHistory(event: StateChangeEvent): void {
    this.history.push(event);

    // 保持历史记录大小在限制内
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.state = {};
    this.observers.clear();
    this.validators.clear();
    this.computed.clear();
    this.history = [];
  }
}

// 导出全局状态管理器单例
export const stateManager = new StateManager();

