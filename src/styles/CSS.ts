/**
 * CSS 生成和处理工具
 */

import {StyleObject, CSSRule, MediaQuery} from './types';

export class CSS {
  /**
   * 生成 CSS 字符串
   * @param declarations - 样式声明对象
   */
  static stringify(declarations: StyleObject): string {
    return Object.entries(declarations)
      .map(([key, value]) => {
        // 将驼峰命名转换为 kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value};`;
      })
      .join(' ');
  }

  /**
   * 生成 CSS 规则
   * @param selector - CSS 选择器
   * @param declarations - 样式声明
   */
  static rule(selector: string, declarations: StyleObject): string {
    const css = this.stringify(declarations);
    return `${selector} { ${css} }`;
  }

  /**
   * 生成多个 CSS 规则
   * @param rules - CSS 规则数组
   */
  static rules(rules: CSSRule[]): string {
    return rules.map((rule) => this.rule(rule.selector, rule.declarations)).join('\n');
  }

  /**
   * 生成媒体查询
   * @param condition - 媒体查询条件
   * @param rules - CSS 规则数组
   */
  static media(condition: string, rules: CSSRule[]): string {
    const content = this.rules(rules);
    return `@media ${condition} { ${content} }`;
  }

  /**
   * 合并样式对象
   * @param styles - 样式对象数组
   */
  static merge(...styles: StyleObject[]): StyleObject {
    return styles.reduce((merged, style) => ({...merged, ...style}), {});
  }

  /**
   * 将驼峰命名转换为 kebab-case
   * @param name - 驼峰命名字符串
   */
  static toKebabCase(name: string): string {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * 将 kebab-case 转换为驼峰命名
   * @param name - kebab-case 字符串
   */
  static toCamelCase(name: string): string {
    return name.replace(/-([a-z])/g, (_match, char) => char.toUpperCase());
  }

  /**
   * 生成 CSS 变量
   * @param name - 变量名
   * @param value - 变量值
   */
  static var(name: string, value: string | number): string {
    return `--${this.toKebabCase(name)}: ${value};`;
  }

  /**
   * 使用 CSS 变量
   * @param name - 变量名
   * @param fallback - 备用值
   */
  static varRef(name: string, fallback?: string | number): string {
    const varName = `--${this.toKebabCase(name)}`;
    return fallback ? `var(${varName}, ${fallback})` : `var(${varName})`;
  }

  /**
   * 生成 CSS 类前缀选择器
   * @param prefix - 前缀
   * @param selector - 选择器
   */
  static prefixed(prefix: string, selector: string): string {
    return `.${prefix}${selector}`;
  }

  /**
   * 生成动画关键帧
   * @param name - 动画名称
   * @param frames - 关键帧对象
   */
  static keyframes(name: string, frames: Record<string, StyleObject>): string {
    const content = Object.entries(frames)
      .map(([percent, declarations]) => `${percent} { ${this.stringify(declarations)} }`)
      .join('\n');
    return `@keyframes ${name} { ${content} }`;
  }
}

