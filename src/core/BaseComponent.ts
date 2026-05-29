/**
 * 基础组件类
 * 所有组件的基类，提供生命周期、事件、状态等基础功能
 */

import {ComponentProps, ComponentState, ComponentElement, ComponentLifecycle} from '../types';
import {DOMAccessor} from './DOMAccessor';

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
      this.lifecycle.onMount?.(this);
    }
  }

  /**
   * 卸载组件
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }

    this.lifecycle.onUnmount?.(this);
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
    this.props = {...this.props, ...props};
    if (this.mounted && this.element) {
      this.rerender();
      this.lifecycle.onUpdate?.(this);
    }
  }

  /**
   * 更新状态
   * @param state - 新的状态
   */
  setState(state: Partial<ComponentState>): void {
    this.state = {...this.state, ...state};
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
    return {...this.props};
  }

  /**
   * 获取组件状态
   */
  getState(): ComponentState {
    return {...this.state};
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

  // ============ DOM 访问和修改 API ============

  /**
   * 查询子元素
   * @param selector - CSS 选择器
   */
  querySelector(selector: string): HTMLElement | null {
    return DOMAccessor.querySelector(this.element, selector);
  }

  /**
   * 查询多个子元素
   * @param selector - CSS 选择器
   */
  querySelectorAll(selector: string): HTMLElement[] {
    return DOMAccessor.querySelectorAll(this.element, selector);
  }

  /**
   * 获取直接子元素
   */
  getChildren(): HTMLElement[] {
    return DOMAccessor.getChildren(this.element);
  }

  /**
   * 获取父元素
   */
  getParent(): HTMLElement | null {
    return DOMAccessor.getParent(this.element);
  }

  /**
   * 设置元素内容（HTML）
   */
  setHTML(html: string): void {
    DOMAccessor.setHTML(this.element, html);
  }

  /**
   * 获取元素内容（HTML）
   */
  getHTML(): string {
    return DOMAccessor.getHTML(this.element);
  }

  /**
   * 设置元素文本
   */
  setText(text: string): void {
    DOMAccessor.setText(this.element, text);
  }

  /**
   * 获取元素文本
   */
  getText(): string {
    return DOMAccessor.getText(this.element);
  }

  /**
   * 添加子元素
   */
  appendChild(child: HTMLElement): void {
    DOMAccessor.appendChild(this.element, child);
  }

  /**
   * 移除子元素
   */
  removeChild(child: HTMLElement): boolean {
    return DOMAccessor.removeChild(this.element, child);
  }

  /**
   * 在元素前插入
   */
  insertBefore(newElement: HTMLElement): void {
    DOMAccessor.insertBefore(this.element, newElement);
  }

  /**
   * 在元素后插入
   */
  insertAfter(newElement: HTMLElement): void {
    DOMAccessor.insertAfter(this.element, newElement);
  }

  /**
   * 替换元素
   */
  replaceChild(newElement: HTMLElement): boolean {
    return DOMAccessor.replaceChild(this.element, newElement);
  }

  /**
   * 清空元素内容
   */
  clear(): void {
    DOMAccessor.clear(this.element);
  }

  /**
   * 移除元素本身
   */
  remove(): void {
    DOMAccessor.remove(this.element);
  }

  /**
   * 设置属性
   */
  setAttribute(name: string, value: string): void {
    DOMAccessor.setAttribute(this.element, name, value);
  }

  /**
   * 获取属性
   */
  getAttribute(name: string): string | null {
    return DOMAccessor.getAttribute(this.element, name);
  }

  /**
   * 移除属性
   */
  removeAttribute(name: string): void {
    DOMAccessor.removeAttribute(this.element, name);
  }

  /**
   * 设置多个属性
   */
  setAttributes(attributes: Record<string, string>): void {
    DOMAccessor.setAttributes(this.element, attributes);
  }

  /**
   * 获取所有属性
   */
  getAttributes(): Record<string, string> {
    return DOMAccessor.getAttributes(this.element);
  }

  /**
   * 设置样式
   */
  setStyle(property: string, value: string): void {
    DOMAccessor.setStyle(this.element, property, value);
  }

  /**
   * 获取样式
   */
  getStyle(property: string): string {
    return DOMAccessor.getStyle(this.element, property);
  }

  /**
   * 设置多个样式
   */
  setStyles(styles: Record<string, string>): void {
    DOMAccessor.setStyles(this.element, styles);
  }

  /**
   * 添加 CSS 类
   */
  addClass(className: string): void {
    DOMAccessor.addClass(this.element, className);
  }

  /**
   * 移除 CSS 类
   */
  removeClass(className: string): void {
    DOMAccessor.removeClass(this.element, className);
  }

  /**
   * 切换 CSS 类
   */
  toggleClass(className: string, force?: boolean): void {
    DOMAccessor.toggleClass(this.element, className, force);
  }

  /**
   * 检查是否拥有 CSS 类
   */
  hasClass(className: string): boolean {
    return DOMAccessor.hasClass(this.element, className);
  }

  /**
   * 获取所有 CSS 类
   */
  getClasses(): string[] {
    return DOMAccessor.getClasses(this.element);
  }

  /**
   * 添加事件监听
   */
  on(event: string, handler: EventListener, options?: AddEventListenerOptions): void {
    DOMAccessor.addEventListener(this.element, event, handler, options);
  }

  /**
   * 移除事件监听
   */
  off(event: string, handler: EventListener): void {
    DOMAccessor.removeEventListener(this.element, event, handler);
  }

  /**
   * 触发自定义事件
   */
  emit(eventName: string, detail?: any): boolean {
    return DOMAccessor.dispatchEvent(this.element, eventName, detail);
  }

  /**
   * 获取元素位置和尺寸信息
   */
  getBounds(): DOMRect | null {
    return DOMAccessor.getBoundingClientRect(this.element);
  }

  /**
   * 获取元素尺寸
   */
  getSize(): {width: number; height: number} {
    return DOMAccessor.getSize(this.element);
  }

  /**
   * 获取元素位置
   */
  getPosition(): {top: number; left: number} {
    return DOMAccessor.getPosition(this.element);
  }

  /**
   * 检查元素是否可见
   */
  isVisible(): boolean {
    return DOMAccessor.isVisible(this.element);
  }

  /**
   * 获取 Shadow DOM
   */
  getShadowRoot(): ShadowRoot | null {
    return DOMAccessor.getShadowRoot(this.element);
  }

  /**
   * 在 Shadow DOM 中查询元素
   */
  queryShadow(selector: string): HTMLElement | null {
    const shadowRoot = this.getShadowRoot();
    return DOMAccessor.queryShadow(shadowRoot, selector);
  }

  /**
   * 在 Shadow DOM 中查询多个元素
   */
  queryShadowAll(selector: string): HTMLElement[] {
    const shadowRoot = this.getShadowRoot();
    return DOMAccessor.queryShadowAll(shadowRoot, selector);
  }

  /**
   * 获取数据属性
   */
  getData(): Record<string, any> {
    return DOMAccessor.getData(this.element);
  }

  /**
   * 设置数据属性
   */
  setData(key: string, value: any): void {
    DOMAccessor.setData(this.element, key, value);
  }

  /**
   * 获取单个数据属性
   */
  getDataValue(key: string): any {
    return DOMAccessor.getDataValue(this.element, key);
  }

  /**
   * 克隆元素
   */
  clone(deep: boolean = true): HTMLElement | null {
    return DOMAccessor.clone(this.element, deep);
  }
}

