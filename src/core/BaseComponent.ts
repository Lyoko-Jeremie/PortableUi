/**
 * 基础组件类
 * 所有组件的基类，提供生命周期、事件、状态等基础功能
 */

import { ComponentProps, ComponentState, ComponentElement, ComponentLifecycle } from '../types';

export abstract class BaseComponent {
  /** 组件 DOM 元素 */
  protected element: ComponentElement = null;

  /** 组件属性 */
  protected props: ComponentProps = {};

  /** 组件状态 */
  protected state: ComponentState = {};

  /** 生命周期回调 */
  protected lifecycle: ComponentLifecycle = {};

  /** 是否已挂载 */
  protected mounted: boolean = false;

  /**
   * 构造函数
   * @param props - 组件属性
   * @param lifecycle - 生命周期回调
   */
  constructor(props: ComponentProps = {}, lifecycle: Partial<ComponentLifecycle> = {}) {
    this.props = props;
    this.lifecycle = lifecycle as ComponentLifecycle;
  }

  /**
   * 挂载组件
   * @param container - 父容器元素
   */
  mount(container: HTMLElement): void {
    if (this.mounted) {
      console.warn(`Component ${this.props.id} is already mounted`);
      return;
    }

    this.element = this.render();
    if (this.element) {
      container.appendChild(this.element);
      this.mounted = true;
      this.lifecycle.onMount?.();
    }
  }

  /**
   * 卸载组件
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }

    this.lifecycle.onUnmount?.();
    if (this.element?.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.mounted = false;
  }

  /**
   * 更新组件
   * @param props - 新的属性
   */
  update(props: Partial<ComponentProps>): void {
    this.props = { ...this.props, ...props };
    if (this.mounted && this.element) {
      this.rerender();
      this.lifecycle.onUpdate?.();
    }
  }

  /**
   * 更新状态
   * @param state - 新的状态
   */
  setState(state: Partial<ComponentState>): void {
    this.state = { ...this.state, ...state };
    if (this.mounted) {
      this.rerender();
    }
  }

  /**
   * 抽象方法：渲染组件
   */
  protected abstract render(): ComponentElement;

  /**
   * 重新渲染组件
   */
  protected rerender(): void {
    if (!this.element) return;

    const newElement = this.render();
    if (newElement && this.element.parentNode) {
      this.element.parentNode.replaceChild(newElement, this.element);
      this.element = newElement;
    }
  }

  /**
   * 获取组件 DOM 元素
   */
  getElement(): ComponentElement {
    return this.element;
  }

  /**
   * 获取组件属性
   */
  getProps(): ComponentProps {
    return { ...this.props };
  }

  /**
   * 获取组件状态
   */
  getState(): ComponentState {
    return { ...this.state };
  }

  /**
   * 检查组件是否已挂载
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    this.unmount();
    this.props = {};
    this.state = {};
    this.lifecycle = {};
  }
}

