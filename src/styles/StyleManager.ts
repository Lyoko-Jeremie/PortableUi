/**
 * 样式管理器
 * 负责动态样式注入、主题管理等
 */

import { Theme, StyleManagerOptions, StyleObject } from './types';
import { getDefaultTheme } from './theme';
import { CSS } from './CSS';

export class StyleManager {
  /** 当前主题 */
  private currentTheme: Theme;

  /** 样式元素集合 */
  private styleElements: Map<string, HTMLStyleElement> = new Map();

  /** 选项配置 */
  private options: StyleManagerOptions;

  /** 主题观察者 */
  private themeObservers: Set<(theme: Theme) => void> = new Set();

  constructor(options?: StyleManagerOptions) {
    this.options = {
      isolate: false,
      prefix: 'pui',
      ...options,
    };

    this.currentTheme = options?.theme || getDefaultTheme();
  }

  /**
   * 注入样式
   * @param id - 样式唯一标识
   * @param css - CSS 文本内容
   * @param target - 目标容器（默认为 head）
   */
  injectStyle(id: string, css: string, target?: HTMLElement): void {
    // 检查是否已经注入
    if (this.styleElements.has(id)) {
      return;
    }

    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;

    const insertTarget = target || document.head;
    insertTarget.appendChild(style);

    this.styleElements.set(id, style);
  }

  /**
   * 移除样式
   * @param id - 样式唯一标识
   */
  removeStyle(id: string): void {
    const style = this.styleElements.get(id);
    if (style) {
      style.remove();
      this.styleElements.delete(id);
    }
  }

  /**
   * 更新样式内容
   * @param id - 样式唯一标识
   * @param css - 新的 CSS 文本内容
   */
  updateStyle(id: string, css: string): void {
    const style = this.styleElements.get(id);
    if (style) {
      style.textContent = css;
    } else {
      this.injectStyle(id, css);
    }
  }

  /**
   * 设置主题
   * @param theme - 主题配置
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.notifyThemeObservers(theme);
  }

  /**
   * 获取当前主题
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * 获取主题颜色
   * @param colorName - 颜色名称
   */
  getThemeColor(colorName: keyof typeof this.currentTheme.colors): string | undefined {
    return this.currentTheme.colors?.[colorName];
  }

  /**
   * 获取主题尺寸
   * @param sizeName - 尺寸名称
   */
  getThemeSize(sizeName: string): string | number | undefined {
    return this.currentTheme.sizes?.[sizeName];
  }

  /**
   * 获取主题间距
   * @param spacingName - 间距名称
   */
  getThemeSpacing(spacingName: string): string | number | undefined {
    return this.currentTheme.spacing?.[spacingName];
  }

  /**
   * 获取主题字体
   * @param fontName - 字体名称
   */
  getThemeFont(fontName: string): string | undefined {
    return this.currentTheme.fonts?.[fontName];
  }

  /**
   * 注册主题变化观察者
   * @param observer - 回调函数
   */
  observeTheme(observer: (theme: Theme) => void): () => void {
    this.themeObservers.add(observer);

    // 返回取消观察的函数
    return () => {
      this.themeObservers.delete(observer);
    };
  }

  /**
   * 生成带前缀的 CSS 类
   * @param className - 类名
   */
  prefixClass(className: string): string {
    return `${this.options.prefix}-${className}`;
  }

  /**
   * 生成样式对象（应用主题颜色）
   * @param baseStyles - 基础样式
   */
  applyTheme(baseStyles: StyleObject): StyleObject {
    const { colors, spacing, sizes } = this.currentTheme;
    const applied = { ...baseStyles };

    // 替换颜色变量
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        if (value === undefined) return;
        Object.entries(applied).forEach(([styleKey, styleValue]) => {
          if (typeof styleValue === 'string' && styleValue.includes(`$color-${key}`)) {
            applied[styleKey] = styleValue.replace(`$color-${key}`, value);
          }
        });
      });
    }

    return applied;
  }

  /**
   * 清空所有注入的样式
   */
  clear(): void {
    for (const style of this.styleElements.values()) {
      style.remove();
    }
    this.styleElements.clear();
  }

  /**
   * 获取所有注入的样式 ID
   */
  getStyleIds(): string[] {
    return Array.from(this.styleElements.keys());
  }

  /**
   * 销毁样式管理器
   */
  destroy(): void {
    this.clear();
    this.themeObservers.clear();
  }

  /**
   * 通知主题观察者
   */
  private notifyThemeObservers(theme: Theme): void {
    for (const observer of this.themeObservers) {
      try {
        observer(theme);
      } catch (error) {
        console.error('Error in theme observer:', error);
      }
    }
  }
}

// 导出全局样式管理器单例
export const styleManager = new StyleManager();


