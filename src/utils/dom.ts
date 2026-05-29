/**
 * DOM 操作工具函数
 */

/**
 * 创建 DOM 元素
 * @param tagName - 标签名称
 * @param attributes - 属性对象
 * @param children - 子元素或文本内容
 */
export function createElement(
  tagName: string,
  attributes?: Record<string, string>,
  children?: (HTMLElement | string)[]
): HTMLElement {
  const element = document.createElement(tagName);

  // 设置属性
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  // 添加子元素
  if (children) {
    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * 添加 CSS 类
 * @param element - DOM 元素
 * @param className - 类名（支持多个空格分隔）
 */
export function addClass(element: HTMLElement, className: string): void {
  const classNames = className.trim().split(/\s+/);
  classNames.forEach((name) => {
    if (name) {
      element.classList.add(name);
    }
  });
}

/**
 * 移除 CSS 类
 * @param element - DOM 元素
 * @param className - 类名（支持多个空格分隔）
 */
export function removeClass(element: HTMLElement, className: string): void {
  const classNames = className.trim().split(/\s+/);
  classNames.forEach((name) => {
    if (name) {
      element.classList.remove(name);
    }
  });
}

/**
 * 切换 CSS 类
 * @param element - DOM 元素
 * @param className - 类名
 * @param force - 强制状态（可选）
 */
export function toggleClass(element: HTMLElement, className: string, force?: boolean): boolean {
  return element.classList.toggle(className, force);
}

/**
 * 检查是否有 CSS 类
 * @param element - DOM 元素
 * @param className - 类名
 */
export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * 设置样式
 * @param element - DOM 元素
 * @param styles - 样式对象
 */
export function setStyle(element: HTMLElement, styles: Record<string, string | number>): void {
  Object.entries(styles).forEach(([key, value]) => {
    (element.style as unknown as Record<string, string | number>)[key] = value;
  });
}

/**
 * 获取样式
 * @param element - DOM 元素
 * @param property - CSS 属性名
 */
export function getStyle(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * 获取位置信息
 * @param element - DOM 元素
 */
export function getPosition(element: HTMLElement): {
  top: number;
  left: number;
  width: number;
  height: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 检查元素是否在视口中
 * @param element - DOM 元素
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 查找最近的父元素
 * @param element - DOM 元素
 * @param selector - CSS 选择器
 */
export function findClosest(element: HTMLElement | null, selector: string): HTMLElement | null {
  while (element && element !== document.documentElement) {
    if (element.matches(selector)) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

/**
 * 添加事件监听器
 * @param element - DOM 元素
 * @param event - 事件名称
 * @param handler - 事件处理函数
 * @param options - 事件选项
 */
export function addEventListener(
  element: HTMLElement | Document | Window,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
): () => void {
  element.addEventListener(event, handler, options);

  // 返回取消监听的函数
  return () => {
    element.removeEventListener(event, handler, options);
  };
}

/**
 * 移除所有子元素
 * @param element - DOM 元素
 */
export function removeAllChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 获取相对于另一个元素的位置
 * @param element - DOM 元素
 * @param parent - 父元素
 */
export function getPositionRelativeTo(
  element: HTMLElement,
  parent: HTMLElement
): { top: number; left: number } {
  const elementRect = element.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();

  return {
    top: elementRect.top - parentRect.top,
    left: elementRect.left - parentRect.left,
  };
}


