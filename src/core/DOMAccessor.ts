/**
 * DOM 访问器
 * 提供灵活的 DOM 访问和修改接口，允许外部直接操作组件 DOM
 */

export class DOMAccessor {
  /**
   * 获取元素
   * @param element - DOM 元素或 null
   */
  static getElement(element: HTMLElement | null): HTMLElement | null {
    return element;
  }

  /**
   * 查询单个子元素
   * @param element - 父元素
   * @param selector - CSS 选择器
   */
  static querySelector(element: HTMLElement | null, selector: string): HTMLElement | null {
    if (!element) return null;
    return element.querySelector(selector) as HTMLElement | null;
  }

  /**
   * 查询多个子元素
   * @param element - 父元素
   * @param selector - CSS 选择器
   */
  static querySelectorAll(element: HTMLElement | null, selector: string): HTMLElement[] {
    if (!element) return [];
    return Array.from(element.querySelectorAll(selector)) as HTMLElement[];
  }

  /**
   * 获取直接子元素
   * @param element - 父元素
   */
  static getChildren(element: HTMLElement | null): HTMLElement[] {
    if (!element) return [];
    return Array.from(element.children) as HTMLElement[];
  }

  /**
   * 获取父元素
   * @param element - 元素
   */
  static getParent(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;
    return element.parentElement as HTMLElement | null;
  }

  /**
   * 设置元素内容（HTML）
   * @param element - 元素
   * @param html - HTML 内容
   */
  static setHTML(element: HTMLElement | null, html: string): void {
    if (!element) return;
    element.innerHTML = html;
  }

  /**
   * 获取元素内容（HTML）
   * @param element - 元素
   */
  static getHTML(element: HTMLElement | null): string {
    if (!element) return '';
    return element.innerHTML;
  }

  /**
   * 设置元素文本内容
   * @param element - 元素
   * @param text - 文本内容
   */
  static setText(element: HTMLElement | null, text: string): void {
    if (!element) return;
    element.textContent = text;
  }

  /**
   * 获取元素文本内容
   * @param element - 元素
   */
  static getText(element: HTMLElement | null): string {
    if (!element) return '';
    return element.textContent || '';
  }

  /**
   * 添加子元素
   * @param parent - 父元素
   * @param child - 子元素
   */
  static appendChild(parent: HTMLElement | null, child: HTMLElement): void {
    if (!parent) return;
    parent.appendChild(child);
  }

  /**
   * 移除子元素
   * @param parent - 父元素
   * @param child - 子元素
   */
  static removeChild(parent: HTMLElement | null, child: HTMLElement): boolean {
    if (!parent || !child.parentElement) return false;
    parent.removeChild(child);
    return true;
  }

  /**
   * 在元素前插入
   * @param element - 参考元素
   * @param newElement - 新元素
   */
  static insertBefore(element: HTMLElement | null, newElement: HTMLElement): void {
    if (!element || !element.parentElement) return;
    element.parentElement.insertBefore(newElement, element);
  }

  /**
   * 在元素后插入
   * @param element - 参考元素
   * @param newElement - 新元素
   */
  static insertAfter(element: HTMLElement | null, newElement: HTMLElement): void {
    if (!element || !element.parentElement) return;
    const next = element.nextElementSibling;
    if (next) {
      element.parentElement.insertBefore(newElement, next);
    } else {
      element.parentElement.appendChild(newElement);
    }
  }

  /**
   * 替换元素
   * @param oldElement - 旧元素
   * @param newElement - 新元素
   */
  static replaceChild(oldElement: HTMLElement | null, newElement: HTMLElement): boolean {
    if (!oldElement || !oldElement.parentElement) return false;
    oldElement.parentElement.replaceChild(newElement, oldElement);
    return true;
  }

  /**
   * 清空元素内容
   * @param element - 元素
   */
  static clear(element: HTMLElement | null): void {
    if (!element) return;
    element.innerHTML = '';
  }

  /**
   * 移除元素
   * @param element - 元素
   */
  static remove(element: HTMLElement | null): void {
    if (!element || !element.parentElement) return;
    element.parentElement.removeChild(element);
  }

  /**
   * 设置属性
   * @param element - 元素
   * @param name - 属性名
   * @param value - 属性值
   */
  static setAttribute(element: HTMLElement | null, name: string, value: string): void {
    if (!element) return;
    element.setAttribute(name, value);
  }

  /**
   * 获取属性
   * @param element - 元素
   * @param name - 属性名
   */
  static getAttribute(element: HTMLElement | null, name: string): string | null {
    if (!element) return null;
    return element.getAttribute(name);
  }

  /**
   * 移除属性
   * @param element - 元素
   * @param name - 属性名
   */
  static removeAttribute(element: HTMLElement | null, name: string): void {
    if (!element) return;
    element.removeAttribute(name);
  }

  /**
   * 设置属性集合
   * @param element - 元素
   * @param attributes - 属性对象
   */
  static setAttributes(element: HTMLElement | null, attributes: Record<string, string>): void {
    if (!element) return;
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  /**
   * 获取所有属性
   * @param element - 元素
   */
  static getAttributes(element: HTMLElement | null): Record<string, string> {
    if (!element) return {};
    const attrs: Record<string, string> = {};
    element.attributes && Array.from(element.attributes).forEach(attr => {
      attrs[attr.name] = attr.value;
    });
    return attrs;
  }

  /**
   * 设置样式
   * @param element - 元素
   * @param property - 样式属性
   * @param value - 样式值
   */
  static setStyle(element: HTMLElement | null, property: string, value: string): void {
    if (!element) return;
    (element.style as any)[this.camelCase(property)] = value;
  }

  /**
   * 获取样式
   * @param element - 元素
   * @param property - 样式属性
   */
  static getStyle(element: HTMLElement | null, property: string): string {
    if (!element) return '';
    return window.getComputedStyle(element).getPropertyValue(property);
  }

  /**
   * 设置多个样式
   * @param element - 元素
   * @param styles - 样式对象
   */
  static setStyles(element: HTMLElement | null, styles: Record<string, string>): void {
    if (!element) return;
    Object.entries(styles).forEach(([property, value]) => {
      this.setStyle(element, property, value);
    });
  }

  /**
   * 添加 CSS 类
   * @param element - 元素
   * @param className - 类名
   */
  static addClass(element: HTMLElement | null, className: string): void {
    if (!element) return;
    element.classList.add(...className.split(' ').filter(Boolean));
  }

  /**
   * 移除 CSS 类
   * @param element - 元素
   * @param className - 类名
   */
  static removeClass(element: HTMLElement | null, className: string): void {
    if (!element) return;
    element.classList.remove(...className.split(' ').filter(Boolean));
  }

  /**
   * 切换 CSS 类
   * @param element - 元素
   * @param className - 类名
   * @param force - 强制状态（可选）
   */
  static toggleClass(element: HTMLElement | null, className: string, force?: boolean): void {
    if (!element) return;
    element.classList.toggle(className, force);
  }

  /**
   * 检查是否拥有 CSS 类
   * @param element - 元素
   * @param className - 类名
   */
  static hasClass(element: HTMLElement | null, className: string): boolean {
    if (!element) return false;
    return element.classList.contains(className);
  }

  /**
   * 获取所有 CSS 类
   * @param element - 元素
   */
  static getClasses(element: HTMLElement | null): string[] {
    if (!element) return [];
    return Array.from(element.classList);
  }

  /**
   * 设置所有 CSS 类
   * @param element - 元素
   * @param classNames - 类名数组
   */
  static setClasses(element: HTMLElement | null, classNames: string[]): void {
    if (!element) return;
    element.className = classNames.join(' ');
  }

  /**
   * 添加事件监听
   * @param element - 元素
   * @param event - 事件名
   * @param handler - 事件处理函数
   * @param options - 事件选项
   */
  static addEventListener(
    element: HTMLElement | null,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (!element) return;
    element.addEventListener(event, handler, options);
  }

  /**
   * 移除事件监听
   * @param element - 元素
   * @param event - 事件名
   * @param handler - 事件处理函数
   */
  static removeEventListener(
    element: HTMLElement | null,
    event: string,
    handler: EventListener
  ): void {
    if (!element) return;
    element.removeEventListener(event, handler);
  }

  /**
   * 触发事件
   * @param element - 元素
   * @param eventName - 事件名
   * @param detail - 事件详情
   */
  static dispatchEvent(
    element: HTMLElement | null,
    eventName: string,
    detail?: any
  ): boolean {
    if (!element) return false;
    const event = new CustomEvent(eventName, {detail, bubbles: true, cancelable: true});
    return element.dispatchEvent(event);
  }

  /**
   * 获取元素位置信息
   * @param element - 元素
   */
  static getBoundingClientRect(element: HTMLElement | null): DOMRect | null {
    if (!element) return null;
    return element.getBoundingClientRect();
  }

  /**
   * 获取元素尺寸
   * @param element - 元素
   */
  static getSize(element: HTMLElement | null): {width: number; height: number} {
    if (!element) return {width: 0, height: 0};
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }

  /**
   * 获取元素位置
   * @param element - 元素
   */
  static getPosition(element: HTMLElement | null): {top: number; left: number} {
    if (!element) return {top: 0, left: 0};
    return {
      top: element.offsetTop,
      left: element.offsetLeft,
    };
  }

  /**
   * 检查元素是否可见
   * @param element - 元素
   */
  static isVisible(element: HTMLElement | null): boolean {
    if (!element) return false;
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  /**
   * 获取元素的 Shadow DOM
   * @param element - 元素
   */
  static getShadowRoot(element: HTMLElement | null): ShadowRoot | null {
    if (!element) return null;
    return element.shadowRoot || null;
  }

  /**
   * 在 Shadow DOM 中查询元素
   * @param shadowRoot - Shadow DOM 根
   * @param selector - CSS 选择器
   */
  static queryShadow(shadowRoot: ShadowRoot | null, selector: string): HTMLElement | null {
    if (!shadowRoot) return null;
    return shadowRoot.querySelector(selector) as HTMLElement | null;
  }

  /**
   * 在 Shadow DOM 中查询多个元素
   * @param shadowRoot - Shadow DOM 根
   * @param selector - CSS 选择器
   */
  static queryShadowAll(shadowRoot: ShadowRoot | null, selector: string): HTMLElement[] {
    if (!shadowRoot) return [];
    return Array.from(shadowRoot.querySelectorAll(selector)) as HTMLElement[];
  }

  /**
   * 将 HTML 字符串转换为元素
   * @param html - HTML 字符串
   */
  static createElement(html: string): HTMLElement | null {
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    return temp.firstElementChild as HTMLElement | null;
  }

  /**
   * 创建多个元素
   * @param html - HTML 字符串
   */
  static createElements(html: string): HTMLElement[] {
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    return Array.from(temp.children) as HTMLElement[];
  }

  /**
   * 克隆元素
   * @param element - 元素
   * @param deep - 是否深度克隆
   */
  static clone(element: HTMLElement | null, deep: boolean = true): HTMLElement | null {
    if (!element) return null;
    return element.cloneNode(deep) as HTMLElement;
  }

  /**
   * 检查元素是否包含另一个元素
   * @param parent - 父元素
   * @param child - 子元素
   */
  static contains(parent: HTMLElement | null, child: HTMLElement | null): boolean {
    if (!parent || !child) return false;
    return parent.contains(child);
  }

  /**
   * 获取元素的数据属性
   * @param element - 元素
   */
  static getData(element: HTMLElement | null): Record<string, any> {
    if (!element) return {};
    return {...element.dataset};
  }

  /**
   * 设置数据属性
   * @param element - 元素
   * @param key - 属性键
   * @param value - 属性值
   */
  static setData(element: HTMLElement | null, key: string, value: any): void {
    if (!element) return;
    element.dataset[key] = String(value);
  }

  /**
   * 获取单个数据属性
   * @param element - 元素
   * @param key - 属性键
   */
  static getDataValue(element: HTMLElement | null, key: string): any {
    if (!element) return undefined;
    return element.dataset[key];
  }

  /**
   * 工具方法：将短横线命名转换为驼峰命名
   * @param str - 字符串
   */
  private static camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  }
}



