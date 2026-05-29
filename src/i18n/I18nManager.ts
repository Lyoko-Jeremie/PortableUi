/**
 * 国际化管理器
 */

import {Language, TranslationTable, I18nConfig, LanguageChangeListener, TranslationMissingListener} from './types';
import {LocaleStrings} from './locales/types';
import {enUS} from './locales/en';
import {zhCN} from './locales/zh';

export class I18nManager {
  /** 当前语言 */
  private currentLanguage: Language;

  /** 默认语言 */
  private defaultLanguage: Language;

  /** 备用语言 */
  private fallbackLanguage: Language;

  /** 翻译表映射 */
  private translations: Map<Language, LocaleStrings> = new Map();

  /** 语言变化监听器 */
  private languageListeners: Set<LanguageChangeListener> = new Set();

  /** 翻译缺失监听器 */
  private missingListeners: Set<TranslationMissingListener> = new Set();

  /** 是否记录缺失翻译 */
  private logMissingTranslations: boolean;

  constructor(config?: I18nConfig) {
    this.defaultLanguage = config?.defaultLanguage || 'en';
    this.fallbackLanguage = config?.fallbackLanguage || 'en';
    this.currentLanguage = this.defaultLanguage;
    this.logMissingTranslations = config?.logMissingTranslations ?? true;

    // 加载内置语言
    this.loadLanguage('en', enUS);
    this.loadLanguage('zh', zhCN);
  }

  /**
   * 加载语言
   * @param language - 语言代码
   * @param translations - 翻译表
   */
  loadLanguage(language: Language, translations: LocaleStrings): void {
    this.translations.set(language, translations);
  }

  /**
   * 设置当前语言
   * @param language - 语言代码
   */
  setLanguage(language: Language): void {
    if (this.currentLanguage === language) {
      return;
    }

    const oldLanguage = this.currentLanguage;
    this.currentLanguage = language;

    // 通知监听器
    this.notifyLanguageListeners(language, oldLanguage);
  }

  /**
   * 获取当前语言
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 翻译（获取翻译字符串）
   * @param key - 翻译键（支持点号分隔，如 'common.ok'）
   * @param replacements - 替换参数
   */
  t(key: string, replacements?: Record<string, string | number>): string {
    const translations = this.translations.get(this.currentLanguage);

    if (!translations) {
      return key;
    }

    let value = this.getNestedValue(translations, key);

    // 如果当前语言没有翻译，尝试备用语言
    if (value === undefined && this.currentLanguage !== this.fallbackLanguage) {
      const fallbackTranslations = this.translations.get(this.fallbackLanguage);
      if (fallbackTranslations) {
        value = this.getNestedValue(fallbackTranslations, key);
      }
    }

    if (value === undefined) {
      // 通知缺失翻译
      this.notifyMissingTranslation(key, this.currentLanguage);

      if (this.logMissingTranslations) {
        console.warn(`Missing translation: ${key} (${this.currentLanguage})`);
      }

      return key;
    }

    // 替换参数
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        value = (value as string).replace(`{${placeholder}}`, String(replacement));
      });
    }

    return value as string;
  }

  /**
   * 注册语言变化监听器
   * @param listener - 监听函数
   */
  onLanguageChange(listener: LanguageChangeListener): () => void {
    this.languageListeners.add(listener);

    // 返回取消监听的函数
    return () => {
      this.languageListeners.delete(listener);
    };
  }

  /**
   * 注册翻译缺失监听器
   * @param listener - 监听函数
   */
  onTranslationMissing(listener: TranslationMissingListener): () => void {
    this.missingListeners.add(listener);

    // 返回取消监听的函数
    return () => {
      this.missingListeners.delete(listener);
    };
  }

  /**
   * 获取所有支持的语言
   */
  getAvailableLanguages(): Language[] {
    return Array.from(this.translations.keys());
  }

  /**
   * 检查语言是否支持
   * @param language - 语言代码
   */
  hasLanguage(language: Language): boolean {
    return this.translations.has(language);
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, key: string): any {
    const keys = key.split('.');
    let value = obj;

    for (const k of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[k];
    }

    return value;
  }

  /**
   * 通知语言变化监听器
   */
  private notifyLanguageListeners(newLanguage: Language, oldLanguage: Language): void {
    for (const listener of this.languageListeners) {
      try {
        listener(newLanguage, oldLanguage);
      } catch (error) {
        console.error('Error in language change listener:', error);
      }
    }
  }

  /**
   * 通知翻译缺失监听器
   */
  private notifyMissingTranslation(key: string, language: Language): void {
    for (const listener of this.missingListeners) {
      try {
        listener(key, language);
      } catch (error) {
        console.error('Error in translation missing listener:', error);
      }
    }
  }

  /**
   * 销毁 I18n 管理器
   */
  destroy(): void {
    this.translations.clear();
    this.languageListeners.clear();
    this.missingListeners.clear();
  }
}

// 导出全局 I18n 管理器单例
export const i18nManager = new I18nManager({
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  logMissingTranslations: true,
});

