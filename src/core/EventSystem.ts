/**
 * 事件系统
 * 提供全局事件发射、监听和管理功能
 */

import {PortableEvent, EventListener, EventListenerOptions, EventEmitOptions} from '../types';

interface EventListenerEntry {
  listener: EventListener;
  options?: EventListenerOptions | undefined;
}

export class EventSystem {
  /** 事件监听器映射 */
  private listeners: Map<string, EventListenerEntry[]> = new Map();

  /** 事件历史 */
  private history: PortableEvent[] = [];

  /** 最大历史记录数 */
  private maxHistory: number = 100;

  /**
   * 注册事件监听器
   * @param eventName - 事件名称
   * @param listener - 监听函数
   * @param options - 监听选项
   */
  on(
    eventName: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const entry: EventListenerEntry = {listener, options: options ?? undefined};
    this.listeners.get(eventName)!.push(entry);

    // 返回取消监听的函数
    return () => {
      this.off(eventName, listener);
    };
  }

  /**
   * 注册一次性事件监听器
   * @param eventName - 事件名称
   * @param listener - 监听函数
   * @param options - 监听选项
   */
  once(
    eventName: string,
    listener: EventListener,
    options?: EventListenerOptions
  ): () => void {
    const wrappedListener: EventListener = (event) => {
      listener(event);
      this.off(eventName, wrappedListener);
    };

    return this.on(eventName, wrappedListener, {...options, once: true});
  }

  /**
   * 移除事件监听器
   * @param eventName - 事件名称
   * @param listener - 监听函数
   */
  off(eventName: string, listener: EventListener): void {
    if (!this.listeners.has(eventName)) {
      return;
    }

    const entries = this.listeners.get(eventName)!;
    const index = entries.findIndex((entry) => entry.listener === listener);

    if (index !== -1) {
      entries.splice(index, 1);
    }

    if (entries.length === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * 触发事件
   * @param eventName - 事件名称
   * @param data - 事件数据
   * @param options - 触发选项
   */
  emit(eventName: string, data?: any, options?: EventEmitOptions): void {
    const event: PortableEvent = new Event(eventName) as PortableEvent;
    event.type = eventName;
    event.data = data;
    event.bubbles = options?.bubbles ?? true;
    event.cancelable = options?.cancelable ?? true;

    // 记录事件历史
    this.addToHistory(event);

    // 触发监听器
    if (this.listeners.has(eventName)) {
      const entries = this.listeners.get(eventName)!;
      for (const entry of entries) {
        try {
          entry.listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      }
    }
  }

  /**
   * 清除特定事件的所有监听器
   * @param eventName - 事件名称
   */
  clear(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 获取事件历史
   * @param eventName - 可选的事件名称，如果指定则只返回该事件的历史
   */
  getHistory(eventName?: string): PortableEvent[] {
    if (eventName) {
      return this.history.filter((event) => event.type === eventName);
    }
    return [...this.history];
  }

  /**
   * 清除事件历史
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 获取特定事件的监听器数量
   */
  listenerCount(eventName: string): number {
    return this.listeners.get(eventName)?.length ?? 0;
  }

  /**
   * 获取所有事件列表
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 向历史记录中添加事件
   */
  private addToHistory(event: PortableEvent): void {
    this.history.push(event);

    // 保持历史记录大小在限制内
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * 销毁事件系统
   */
  destroy(): void {
    this.listeners.clear();
    this.history = [];
  }
}

// 导出全局事件系统单例
export const globalEventSystem = new EventSystem();



