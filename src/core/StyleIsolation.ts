/**
 * 样式隔离系统
 * 使用 Shadow DOM 实现样式隔离，防止样式污染
 */

export class StyleIsolation {
  /** Shadow DOM 宿主映射 */
  private shadowHosts: Map<HTMLElement, ShadowRoot> = new Map();

  /** 样式缓存 */
  private styleCache: Map<string, HTMLStyleElement> = new Map();

  /**
   * 为元素创建 Shadow DOM
   * @param host - 宿主元素
   * @param styles - CSS 样式文本
   * @returns Shadow DOM 根元素
   */
  createShadowRoot(host: HTMLElement, styles?: string): ShadowRoot {
    // 如果已经有 Shadow DOM，直接返回
    if (this.shadowHosts.has(host)) {
      return this.shadowHosts.get(host)!;
    }

    // 创建 Shadow DOM
    const shadowRoot = host.attachShadow({ mode: 'open' });

    // 如果提供了样式，注入到 Shadow DOM 中
    if (styles) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      shadowRoot.appendChild(styleElement);
    }

    this.shadowHosts.set(host, shadowRoot);
    return shadowRoot;
  }

  /**
   * 向 Shadow DOM 中追加样式
   * @param shadowRoot - Shadow DOM 根元素
   * @param styles - CSS 样式文本
   * @param cacheKey - 缓存键（可选）
   */
  appendStyles(shadowRoot: ShadowRoot, styles: string, cacheKey?: string): void {
    // 检查缓存
    if (cacheKey && this.styleCache.has(cacheKey)) {
      const cachedStyle = this.styleCache.get(cacheKey)!;
      shadowRoot.appendChild(cachedStyle.cloneNode(true));
      return;
    }

    // 创建样式元素
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    // 缓存样式元素
    if (cacheKey) {
      this.styleCache.set(cacheKey, styleElement);
    }

    shadowRoot.appendChild(styleElement);
  }

  /**
   * 移除 Shadow DOM
   * @param host - 宿主元素
   */
  removeShadowRoot(host: HTMLElement): void {
    if (this.shadowHosts.has(host)) {
      const shadowRoot = this.shadowHosts.get(host)!;
      // 清空 Shadow DOM 内容
      shadowRoot.innerHTML = '';
      this.shadowHosts.delete(host);
    }
  }

  /**
   * 检查元素是否有 Shadow DOM
   * @param host - 宿主元素
   */
  hasShadowRoot(host: HTMLElement): boolean {
    return this.shadowHosts.has(host);
  }

  /**
   * 获取元素的 Shadow DOM
   * @param host - 宿主元素
   */
  getShadowRoot(host: HTMLElement): ShadowRoot | null {
    return this.shadowHosts.get(host) ?? null;
  }

  /**
   * 创建隔离容器
   * @param styles - CSS 样式文本
   * @param content - 内容创建函数
   */
  createIsolatedContainer(
    styles: string,
    content?: (shadowRoot: ShadowRoot) => void
  ): HTMLElement {
    const host = document.createElement('div');
    const shadowRoot = this.createShadowRoot(host, styles);

    if (content) {
      content(shadowRoot);
    }

    return host;
  }

  /**
   * 清除所有 Shadow DOM
   */
  clear(): void {
    for (const [host, shadowRoot] of this.shadowHosts) {
      shadowRoot.innerHTML = '';
    }
    this.shadowHosts.clear();
  }

  /**
   * 清除样式缓存
   */
  clearStyleCache(): void {
    this.styleCache.clear();
  }

  /**
   * 销毁样式隔离系统
   */
  destroy(): void {
    this.clear();
    this.clearStyleCache();
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    shadowHostCount: number;
    styleCacheCount: number;
  } {
    return {
      shadowHostCount: this.shadowHosts.size,
      styleCacheCount: this.styleCache.size,
    };
  }
}

// 导出全局样式隔离系统单例
export const styleIsolation = new StyleIsolation();

