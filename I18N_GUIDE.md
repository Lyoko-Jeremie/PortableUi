# PortableUi i18n 使用指南

## 目录

- [概述](#概述)
- [快速开始](#快速开始)
- [核心概念](#核心概念)
- [API 参考](#api-参考)
- [使用示例](#使用示例)
- [类型安全](#类型安全)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 概述

PortableUi 提供了一个强大的国际化（i18n）系统，具有以下特性：

✅ **完全类型安全** - 通过 TypeScript 编译期类型检查保证翻译键的正确性
✅ **零运行时成本** - 类型检查在编译期完成，运行时无额外开销
✅ **灵活的访问方式** - 支持点语法（`i18n.common.ok`）和方法调用（`i18nManager.t('common.ok')`）
✅ **自动语言切换** - 改变语言后自动更新所有翻译
✅ **参数替换** - 支持动态参数的模板字符串
✅ **缺失翻译检测** - 自动检测并报告缺失的翻译

---

## 快速开始

### 1. 基本使用

```typescript
import { i18n, i18nManager } from '@portable-ui/i18n';

// 方式一：点语法访问（推荐）
console.log(i18n.common.ok);          // "OK" (English) 或 "确定" (Chinese)

// 方式二：方法调用
console.log(i18nManager.t('common.ok')); // "OK" (English) 或 "确定" (Chinese)
```

### 2. 切换语言

```typescript
// 切换到中文
i18nManager.setLanguage('zh');
console.log(i18n.common.ok); // "确定"

// 切换回英文
i18nManager.setLanguage('en');
console.log(i18n.common.ok); // "OK"
```

### 3. 参数替换

```typescript
// 使用参数替换
const message = i18nManager.t('messages.deleteSuccess', {
  item: 'user'
});
// 输出: "Deleted successfully" 或 "删除成功"

// 带有参数的翻译键
const pageInfo = i18nManager.t('components.table.pageInfo', {
  page: 1,
  total: 10
});
// 输出: "Page 1 of 10" 或 "第 1 页，共 10 条"
```

---

## 核心概念

### 翻译表结构

所有翻译必须遵循 `LocaleStrings` 接口的结构。该接口定义了所有支持的翻译键和它们的含义：

```typescript
export interface LocaleStrings {
  // 通用翻译
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    // ... 更多翻译
  };

  // 组件相关翻译
  components: {
    button: {
      submit: string;
      reset: string;
      default: string;
    };
    // ... 更多组件翻译
  };

  // 验证相关翻译
  validation: {
    required: string;
    email: string;
    // ... 更多验证翻译
  };

  // 消息翻译
  messages: {
    saveSuccess: string;
    deleteSuccess: string;
    // ... 更多消息
  };
}
```

### 支持的语言

当前支持的语言：
- `en` - 英文
- `zh` - 简体中文

### 翻译键类型

所有翻译键都经过 TypeScript 类型检查，合法的键包括：
- `common.ok`
- `common.cancel`
- `components.button.submit`
- `validation.required`
- `messages.saveSuccess`
- ... 等等

---

## API 参考

### I18nManager 类

#### 方法

##### `setLanguage(language: Language): void`

切换当前语言。

```typescript
i18nManager.setLanguage('zh'); // 切换到中文
```

**参数:**
- `language` - 语言代码（'en' 或 'zh'）

---

##### `getLanguage(): Language`

获取当前使用的语言。

```typescript
const currentLang = i18nManager.getLanguage(); // 'en' 或 'zh'
```

**返回值:**
- 当前语言代码

---

##### `t(key: LocaleStringKey, replacements?: Record<string, string | number>): string`

获取翻译字符串。支持参数替换。

```typescript
// 基本用法
const okText = i18nManager.t('common.ok');

// 带参数替换
const message = i18nManager.t('components.table.pageInfo', {
  page: 1,
  total: 10
});
```

**参数:**
- `key` - 翻译键（完全类型安全）
- `replacements` - 可选的参数替换对象

**返回值:**
- 翻译后的字符串

---

##### `loadLanguage(language: Language, translations: LocaleStrings): void`

加载或更新语言翻译表。

```typescript
import { i18nManager } from '@portable-ui/i18n';
import { zhCN } from '@portable-ui/i18n/locales/zh';

// 加载中文翻译
i18nManager.loadLanguage('zh', zhCN);
```

**参数:**
- `language` - 语言代码
- `translations` - 翻译表对象（必须符合 LocaleStrings 接口）

---

##### `onLanguageChange(listener: LanguageChangeListener): () => void`

监听语言变化事件。

```typescript
const unsubscribe = i18nManager.onLanguageChange((newLanguage, oldLanguage) => {
  console.log(`语言从 ${oldLanguage} 切换到 ${newLanguage}`);
});

// 取消监听
unsubscribe();
```

**参数:**
- `listener` - 回调函数，接收新语言和旧语言

**返回值:**
- 取消监听的函数

---

##### `onTranslationMissing(listener: TranslationMissingListener): () => void`

监听缺失翻译事件。

```typescript
i18nManager.onTranslationMissing((key, language) => {
  console.warn(`缺失翻译: ${key} (${language})`);
});
```

**参数:**
- `listener` - 回调函数，接收翻译键和语言代码

**返回值:**
- 取消监听的函数

---

##### `getAvailableLanguages(): Language[]`

获取所有可用的语言列表。

```typescript
const languages = i18nManager.getAvailableLanguages(); // ['en', 'zh']
```

**返回值:**
- 语言代码数组

---

##### `hasLanguage(language: Language): boolean`

检查是否支持某个语言。

```typescript
const hasZh = i18nManager.hasLanguage('zh'); // true
```

**参数:**
- `language` - 语言代码

**返回值:**
- 布尔值

---

### 全局对象

#### `i18n`

提供点语法访问的类型安全代理。

```typescript
import { i18n } from '@portable-ui/i18n';

// 点语法访问（完全类型安全）
i18n.common.ok
i18n.components.button.submit
i18n.components.table.pageInfo
```

**优势:**
- 完全类型安全
- IDE 自动完成
- 编译期错误检查

---

#### `i18nManager`

全局 I18nManager 单例实例。

```typescript
import { i18nManager } from '@portable-ui/i18n';

i18nManager.setLanguage('zh');
```

---

## 使用示例

### 示例 1：在组件中使用翻译

```typescript
import { BaseComponent } from '@portable-ui/core';
import { i18n, i18nManager } from '@portable-ui/i18n';

class MyButton extends BaseComponent {
  render() {
    const buttonElement = document.createElement('button');
    // 使用点语法获取翻译
    buttonElement.textContent = i18n.components.button.submit;
    
    // 监听语言变化
    const unsubscribe = i18nManager.onLanguageChange(() => {
      buttonElement.textContent = i18n.components.button.submit;
    });
    
    return buttonElement;
  }
}
```

### 示例 2：处理带参数的翻译

```typescript
// 在验证消息中使用参数
function validateInput(value: string, minLength: number) {
  if (value.length < minLength) {
    return i18nManager.t('validation.minLength', {
      min: minLength
    });
  }
  return null;
}

// 使用
const error = validateInput('abc', 5);
// 英文: "Please enter at least 5 characters"
// 中文: "最少输入 5 个字符"
```

### 示例 3：创建多语言应用

```typescript
import { i18nManager } from '@portable-ui/i18n';

class App {
  constructor() {
    // 初始化为英文
    i18nManager.setLanguage('en');
    
    // 监听语言变化
    i18nManager.onLanguageChange((newLang) => {
      this.updateUI();
    });
    
    // 监听缺失翻译
    i18nManager.onTranslationMissing((key, lang) => {
      console.warn(`Missing translation: ${key} in ${lang}`);
    });
  }
  
  switchLanguage(lang: 'en' | 'zh') {
    i18nManager.setLanguage(lang);
  }
  
  updateUI() {
    // 重新渲染 UI
  }
}
```

### 示例 4：扩展翻译表

要添加新的翻译，需要：

1. 更新 `src/i18n/locales/types.ts` 中的 `LocaleStrings` 接口
2. 在 `src/i18n/locales/en.ts` 中添加英文翻译
3. 在 `src/i18n/locales/zh.ts` 中添加中文翻译

```typescript
// types.ts
export interface LocaleStrings {
  // ...existing...
  
  // 新增分组
  footer: {
    copyright: string;
    version: string;
  };
}

// en.ts
export const enUS: LocaleStrings = {
  // ...existing...
  
  footer: {
    copyright: '© 2024 MyApp',
    version: 'v1.0.0'
  }
};

// zh.ts
export const zhCN: LocaleStrings = {
  // ...existing...
  
  footer: {
    copyright: '© 2024 我的应用',
    version: 'v1.0.0'
  }
};
```

添加后自动获得类型安全：

```typescript
i18n.footer.copyright; // 类型安全
i18nManager.t('footer.copyright'); // 类型安全
```

---

## 类型安全

### 编译期检查

PortableUi i18n 系统通过 TypeScript 类型系统实现编译期检查：

#### 1. 翻译表结构检查

```typescript
// ❌ 错误：缺少 'cancel' 字段
export const zhCN: LocaleStrings = {
  common: {
    ok: '确定',
    // cancel 缺失 - 编译错误！
  }
};
```

#### 2. 翻译键检查

```typescript
// ❌ 错误：无效的翻译键
i18nManager.t('common.invalid'); // 编译错误！

// ✅ 正确：有效的翻译键
i18nManager.t('common.ok'); // 编译通过
```

#### 3. 点语法访问检查

```typescript
// ❌ 错误：不存在的路径
i18n.common.invalid; // 编译错误！

// ✅ 正确：有效的路径
i18n.common.ok; // 编译通过
```

### IDE 自动完成

由于完整的类型支持，你的 IDE 会提供：

- 自动完成建议
- 参数类型提示
- 错误早期发现

---

## 最佳实践

### 1. 使用点语法而非方法调用

```typescript
// ✅ 推荐
i18n.components.button.submit

// ⚠️ 不推荐（虽然也可以用）
i18nManager.t('components.button.submit')
```

**原因:**
- 更好的类型检查
- IDE 自动完成更友好
- 代码更简洁

### 2. 组织翻译结构

```typescript
// ✅ 好的结构
{
  common: { ok, cancel, save },
  components: {
    button: { submit, reset },
    input: { placeholder }
  },
  validation: { required, email }
}

// ❌ 不好的结构
{
  buttonSubmit,
  buttonReset,
  inputPlaceholder,
  validationRequired
}
```

**原因:**
- 更易维护和扩展
- 更符合直觉
- 便于查找相关翻译

### 3. 统一参数命名

在翻译字符串中使用一致的参数名：

```typescript
// 定义翻译
{
  messages: {
    deleteSuccess: 'Deleted {item} successfully', // {item}
    saveSuccess: 'Saved {item} successfully'       // {item}
  }
}

// 使用
i18nManager.t('messages.deleteSuccess', { item: 'user' });
i18nManager.t('messages.saveSuccess', { item: 'document' });
```

### 4. 处理缺失翻译

在生产环境中应该监听缺失翻译事件：

```typescript
if (process.env.NODE_ENV !== 'production') {
  i18nManager.onTranslationMissing((key, language) => {
    console.warn(`Missing i18n: ${key} (${language})`);
  });
}
```

### 5. 支持新语言

要添加新语言（如日文），按照以下步骤：

```typescript
// 1. 更新 types.ts 中的 Language 类型
export type Language = 'en' | 'zh' | 'ja';

// 2. 创建 ja.ts
export const jaJP: LocaleStrings = { /* ... */ };

// 3. 在 I18nManager 中加载
i18nManager.loadLanguage('ja', jaJP);

// 4. 使用
i18nManager.setLanguage('ja');
```

---

## 常见问题

### Q1: 我改变了语言，但 UI 没有更新怎么办？

**A:** 语言改变后，你需要手动更新 UI。使用 `onLanguageChange` 监听事件：

```typescript
i18nManager.onLanguageChange(() => {
  // 重新渲染 UI
  updateComponent();
});
```

### Q2: 如何处理复杂的参数替换？

**A:** 使用多个参数和合理的模板字符串设计：

```typescript
// 定义
validation: {
  rangeLength: 'Please enter {min} to {max} characters'
}

// 使用
i18nManager.t('validation.rangeLength', {
  min: 3,
  max: 20
});
```

### Q3: 可以动态加载翻译吗？

**A:** 可以。使用 `loadLanguage` 方法：

```typescript
// 从服务器加载翻译
const translations = await fetch('/api/i18n/ja').then(r => r.json());
i18nManager.loadLanguage('ja', translations);
i18nManager.setLanguage('ja');
```

### Q4: 如何添加新的翻译键？

**A:** 修改 `src/i18n/locales/types.ts`、`en.ts` 和 `zh.ts`：

```typescript
// 1. 修改接口
export interface LocaleStrings {
  // ...existing...
  newCategory: {
    newKey: string;
  }
}

// 2. 添加英文翻译
export const enUS: LocaleStrings = {
  // ...existing...
  newCategory: {
    newKey: 'New Text'
  }
}

// 3. 添加中文翻译
export const zhCN: LocaleStrings = {
  // ...existing...
  newCategory: {
    newKey: '新文本'
  }
}
```

添加后自动获得类型安全。

### Q5: 编译时出现类型错误怎么办？

**A:** 查看错误信息，通常是以下原因之一：

1. **翻译表不完整** - 确保所有语言文件都包含 LocaleStrings 的所有字段
2. **新增的翻译键未同时更新所有语言** - 保持各语言文件的结构一致
3. **拼写错误** - 仔细检查翻译键的拼写

```typescript
// 错误示例
export const zhCN: LocaleStrings = {
  common: {
    ok: '确定',
    // ❌ 缺少 'cancel' - 编译错误：Property 'cancel' is missing
  }
};

// 修正
export const zhCN: LocaleStrings = {
  common: {
    ok: '确定',
    cancel: '取消', // ✅ 补全
  }
};
```

---

## 总结

PortableUi i18n 系统的核心优势：

- 🔒 **编译期类型安全** - 所有翻译键都在编译时检查
- ⚡ **零运行时开销** - 没有额外的类型检查成本
- 🎯 **点语法支持** - 简洁优雅的 API
- 🗣️ **多语言支持** - 易于扩展新语言
- 🔄 **动态语言切换** - 支持运行时切换和事件监听
- 📝 **参数替换** - 灵活的模板化消息

通过遵循本指南，你可以轻松构建完全国际化的应用程序！

---

**最后更新:** 2024-05-30

