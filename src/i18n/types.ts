/**
 * 国际化系统类型定义
 */

/** 支持的语言 */
export type Language = 'en' | 'zh';

/** 翻译表 */
export interface TranslationTable {
  [key: string]: string | TranslationTable;
}

/**
 * 将嵌套翻译表映射为可通过点语法访问的类型。
 * 例如：i18n.common.ok
 */
export type I18nAccessor<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : I18nAccessor<T[K]>;
};

/** 国际化配置 */
export interface I18nConfig {
  /** 默认语言 */
  defaultLanguage?: Language;
  /** 备用语言 */
  fallbackLanguage?: Language;
  /** 是否打印缺失的翻译 */
  logMissingTranslations?: boolean;
}

/** 国际化事件 */
export interface I18nEvent {
  /** 事件类型 */
  type: 'languageChange' | 'translationLoad' | 'translationMissing';
  /** 负载 */
  payload?: any;
}

/** 语言变化回调 */
export type LanguageChangeListener = (newLanguage: Language, oldLanguage?: Language) => void;

/** 翻译缺失回调 */
export type TranslationMissingListener = (key: string, language: Language) => void;

