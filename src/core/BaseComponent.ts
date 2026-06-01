/**
 * 基础组件类
 * 所有组件的基类，提供生命周期、事件、状态等基础功能
 */

import {ComponentProps, ComponentState, ComponentElement, ComponentLifecycle} from '../types';
import {DOMAccessor} from './DOMAccessor';
import {extensibilityManager} from './Extensibility';
import {effect, signal} from 'alien-signals';

const COMPONENT_INSTANCE_KEY = '__portableui_component_instance__';

export interface BaseState {
}

export abstract class BaseComponent<S extends BaseState = any> {
  signalState: ReturnType<typeof signal<S>>;

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

  private static escapeAttributeSelectorValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private getActiveElementWithinRoot(element: HTMLElement): HTMLElement | null {
    const rootNode = element.getRootNode();
    const activeElement = rootNode instanceof ShadowRoot ? rootNode.activeElement : document.activeElement;

    if (!(activeElement instanceof HTMLElement) || !element.contains(activeElement)) {
      return null;
    }

    return activeElement;
  }

  private getElementPath(root: HTMLElement, target: HTMLElement): number[] | null {
    if (root === target) {
      return [];
    }

    const path: number[] = [];
    let current: HTMLElement | null = target;

    while (current && current !== root) {
      const parentElement: HTMLElement | null = current.parentElement;
      if (!parentElement) {
        return null;
      }

      const index = Array.prototype.indexOf.call(parentElement.children, current) as number;
      if (index < 0) {
        return null;
      }

      path.unshift(index);
      current = parentElement;
    }

    return current === root ? path : null;
  }

  private resolveElementByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: HTMLElement | null = root;

    for (const index of path) {
      if (!current || index < 0 || index >= current.children.length) {
        return null;
      }

      const next = current.children.item(index);
      if (!(next instanceof HTMLElement)) {
        return null;
      }

      current = next;
    }

    return current;
  }

  private captureFocusState(element: HTMLElement): {
    isRootFocused: boolean;
    selectorId: string | null;
    elementPath: number[] | null;
    selectionStart: number | null;
    selectionEnd: number | null;
    selectionDirection: SelectionDirection | null;
  } | null {
    const activeElement = this.getActiveElementWithinRoot(element);
    if (!activeElement) {
      return null;
    }

    const isRootFocused = activeElement === element;
    const selectorId = activeElement.id || (isRootFocused ? element.id || null : null);
    const isTextLikeInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;

    return {
      isRootFocused,
      selectorId,
      elementPath: this.getElementPath(element, activeElement),
      selectionStart: isTextLikeInput ? activeElement.selectionStart : null,
      selectionEnd: isTextLikeInput ? activeElement.selectionEnd : null,
      selectionDirection: isTextLikeInput ? activeElement.selectionDirection : null,
    };
  }

  private restoreFocusState(element: HTMLElement, focusState: ReturnType<BaseComponent['captureFocusState']>): void {
    if (!focusState) {
      return;
    }

    let target: HTMLElement | null = null;
    if (focusState.isRootFocused) {
      target = element;
    } else if (focusState.selectorId) {
      const selectorId = BaseComponent.escapeAttributeSelectorValue(focusState.selectorId);
      const selector = `[id="${selectorId}"]`;
      target = element.matches(selector) ? element : (element.querySelector(selector) as HTMLElement | null);
    }

    if (!target && focusState.elementPath) {
      target = this.resolveElementByPath(element, focusState.elementPath);
    }

    if (!target) {
      return;
    }

    target.focus();

    if (focusState.selectionStart != null && focusState.selectionEnd != null &&
      (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) &&
      typeof target.setSelectionRange === 'function') {
      try {
        target.setSelectionRange(
          focusState.selectionStart,
          focusState.selectionEnd,
          focusState.selectionDirection ?? 'none'
        );
      } catch {
        // Ignore selection restore failures for non-text inputs or browser edge cases.
      }
    }
  }

  private hasPropChanges(nextProps: ComponentProps): boolean {
    const currentKeys = Object.keys(this.props);
    const nextKeys = Object.keys(nextProps);

    if (currentKeys.length !== nextKeys.length) {
      return true;
    }

    for (const key of nextKeys) {
      if (!Object.prototype.hasOwnProperty.call(this.props, key)) {
        return true;
      }

      const currentValue = this.getComparisonValue(key);
      if (!Object.is(currentValue, (nextProps as Record<string, unknown>)[key])) {
        return true;
      }
    }

    return false;
  }

  private getComparisonValue(key: string): unknown {
    if (!this.element) {
      return (this.props as Record<string, unknown>)[key];
    }

    if (key === 'value' && (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement || this.element instanceof HTMLSelectElement)) {
      return this.element.value;
    }

    if (key === 'checked' && this.element instanceof HTMLInputElement) {
      return this.element.checked;
    }

    return (this.props as Record<string, unknown>)[key];
  }

  /**
   * 构造函数
   * @param props - 组件属性
   * @param lifecycle - 生命周期回调
   */
  constructor(props: ComponentProps = {}, lifecycle: Partial<ComponentLifecycle> = {}) {
    this.props = props;
    this.lifecycle = lifecycle as ComponentLifecycle;
    this.signalState = signal<S>(this.props as S);

    effect(() => {
      const currentState = this.signalState();
      this.props = {...this.props, ...(currentState as ComponentProps)};

      if (this.mounted && this.element) {
        this.rerender();
      }
    });

    // 初始化组件id
    this.initializeComponentId();
  }

  /**
   * 初始化组件ID，如果未提供则自动生成
   * 生成格式: {ComponentName}_{randomString}
   */
  private initializeComponentId(): void {
    if (!this.props.id) {
      const componentName = this.constructor.name;
      const randomString = Math.random().toString(36).substr(2, 9);
      this.props.id = `${componentName}_${randomString}`;
    }
  }

  /**
   * 获取组件ID
   */
  getId(): string {
    return this.props.id || '';
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

    try {
      extensibilityManager.runLifecycle('mount', this, {container}, () => {
        this.element = this.render();
        if (this.element) {
          this.bindElementMetadata(this.element);
          container.appendChild(this.element);
          this.mounted = true;
          this.lifecycle.onMount?.(this);
        }
      });
    } catch (error) {
      this.lifecycle.onError?.(this, error as Error);
      throw error;
    }
  }

  /**
   * 卸载组件
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }

    try {
      extensibilityManager.runLifecycle('unmount', this, undefined, () => {
        this.lifecycle.onUnmount?.(this);
        if (this.element?.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.unbindElementMetadata(this.element);
        this.element = null;
        this.mounted = false;
      });
    } catch (error) {
      this.lifecycle.onError?.(this, error as Error);
      throw error;
    }
  }

  /**
   * 更新组件
   * @param props - 新的属性
   */
  update(props: Partial<ComponentProps>): void {
    const nextProps = {...this.props, ...props};

    if (this.mounted && this.element && !this.hasPropChanges(nextProps)) {
      return;
    }

    if (!this.mounted || !this.element) {
      this.props = nextProps;
      this.signalState({...this.signalState(), ...nextProps} as S);
      return;
    }

    try {
      extensibilityManager.runLifecycle('update', this, {props: nextProps}, () => {
        this.props = nextProps;
        this.signalState({...this.signalState(), ...nextProps} as S);
        this.lifecycle.onUpdate?.(this);
      });
    } catch (error) {
      this.lifecycle.onError?.(this, error as Error);
      throw error;
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

    const focusState = this.captureFocusState(this.element);
    const newElement = this.render();
    if (newElement && this.element.parentNode) {
      this.bindElementMetadata(newElement);
      this.unbindElementMetadata(this.element);
      this.element.parentNode.replaceChild(newElement, this.element);
      this.element = newElement;
      this.restoreFocusState(newElement, focusState);
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

  // ============ 组件查询 API（DOM 范围） ============

  /**
   * 在当前组件根元素范围内，通过ID查询组件实例
   * @param id - 组件ID
   */
  findComponentById<T extends BaseComponent = BaseComponent>(id: string): T | null {
    return BaseComponent.queryComponentById<T>(this.element, id);
  }

  /**
   * 在当前组件根元素范围内，通过ID查询组件元素
   * @param id - 组件ID
   */
  findElementById(id: string): HTMLElement | null {
    return BaseComponent.queryElementById(this.element, id);
  }

  /**
   * 在当前组件根元素范围内，查询子组件实例
   * @param deep - 是否递归查询所有后代组件，false 时仅查询直接子组件
   */
  findChildComponents<T extends BaseComponent = BaseComponent>(deep: boolean = true): T[] {
    return BaseComponent.queryChildComponents<T>(this.element, deep);
  }

  /**
   * 查询当前组件的父组件实例（最近的祖先组件）
   */
  findParentComponent<T extends BaseComponent = BaseComponent>(): T | null {
    return BaseComponent.queryParentComponent<T>(this.element);
  }

  /**
   * 在指定容器范围内，通过ID查询组件实例（不依赖全局静态存储）
   * @param container - 查询范围容器
   * @param id - 组件ID
   */
  static queryComponentById<T extends BaseComponent = BaseComponent>(
    container: ParentNode | null,
    id: string
  ): T | null {
    const element = BaseComponent.queryElementById(container, id);
    if (!element) {
      return null;
    }

    return BaseComponent.readComponentFromElement<T>(element);
  }

  /**
   * 在指定容器范围内，通过ID查询组件DOM元素
   * @param container - 查询范围容器
   * @param id - 组件ID
   */
  static queryElementById(container: ParentNode | null, id: string): HTMLElement | null {
    if (!container || !id) {
      return null;
    }

    const selectorId = id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return container.querySelector(`[id="${selectorId}"]`);
  }

  /**
   * 在指定容器范围内，查询子组件实例
   * @param container - 查询范围容器
   * @param deep - 是否递归查询所有后代组件，false 时仅查询直接子组件
   */
  static queryChildComponents<T extends BaseComponent = BaseComponent>(
    container: ParentNode | null,
    deep: boolean = true
  ): T[] {
    if (!container) {
      return [];
    }

    const nodes: HTMLElement[] = [];

    if (deep) {
      if ('querySelectorAll' in container) {
        const descendants = container.querySelectorAll('*');
        for (const node of descendants) {
          if (node instanceof HTMLElement) {
            nodes.push(node);
          }
        }
      }
    } else {
      const directChildren = container instanceof Element
        ? Array.from(container.children)
        : Array.from(container.childNodes);

      for (const node of directChildren) {
        if (node instanceof HTMLElement) {
          nodes.push(node);
        }
      }
    }

    const components: T[] = [];
    for (const node of nodes) {
      const component = BaseComponent.readComponentFromElement<T>(node);
      if (component) {
        components.push(component);
      }
    }

    return components;
  }

  /**
   * 从指定元素向上查询最近的父组件实例
   * @param element - 起始元素
   */
  static queryParentComponent<T extends BaseComponent = BaseComponent>(element: Node | null): T | null {
    if (!element) {
      return null;
    }

    let current: Node | null = element.parentNode;
    while (current) {
      if (current instanceof HTMLElement) {
        const component = BaseComponent.readComponentFromElement<T>(current);
        if (component) {
          return component;
        }
      }
      current = current.parentNode;
    }

    return null;
  }

  /**
   * 将组件实例绑定到其根元素，供范围查询读取
   */
  private bindElementMetadata(element: HTMLElement): void {
    if (!this.props.id) {
      return;
    }

    element.id = this.props.id;
    (element as HTMLElement & { [COMPONENT_INSTANCE_KEY]?: BaseComponent<any> })[COMPONENT_INSTANCE_KEY] = this;
  }

  /**
   * 解除根元素上的组件实例绑定
   */
  private unbindElementMetadata(element: ComponentElement): void {
    if (!element) {
      return;
    }

    delete (element as HTMLElement & { [COMPONENT_INSTANCE_KEY]?: BaseComponent<any> })[COMPONENT_INSTANCE_KEY];
  }

  /**
   * 从元素上读取组件实例绑定
   */
  private static readComponentFromElement<T extends BaseComponent = BaseComponent>(element: HTMLElement): T | null {
    const component = (element as HTMLElement & { [COMPONENT_INSTANCE_KEY]?: BaseComponent<any> })[COMPONENT_INSTANCE_KEY];
    if (!component) {
      return null;
    }

    return component as T;
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
  getSize(): { width: number; height: number } {
    return DOMAccessor.getSize(this.element);
  }

  /**
   * 获取元素位置
   */
  getPosition(): { top: number; left: number } {
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

