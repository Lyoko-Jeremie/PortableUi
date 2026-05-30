# 核心需求：外部 DOM 访问和修改

## 需求描述

项目需要支持让用户从库外部直接访问并修改由 PortableUi 组件生成的 DOM 元素。这是一个**关键设计原则**，确保库的**灵活性**和**可维护性**。

## 为什么这很重要

### 1. 易用性（Usability）
用户可以直接获取组件的 DOM 元素，进行自定义修改，而无需深入理解组件内部结构。

### 2. 灵活性（Flexibility）
支持超出组件设计范围的独特使用场景：
- 动态内容更新
- 复杂的用户交互
- 与现有 JavaScript 代码集成
- 第三方库集成

### 3. 样式隔离的平衡
虽然使用 Shadow DOM 实现样式隔离，但用户仍然可以：
- 访问隔离内的元素
- 修改样式和属性
- 添加/移除 CSS 类

### 4. 兼容性（Compatibility）
适配 Greasemonkey、Tampermonkey 等跨域脚本环境，这些环境通常需要直接的 DOM 操控能力。

## 实现方案

### 核心组件

#### 1. DOMAccessor 类 (`src/core/DOMAccessor.ts`)
静态工具类，提供 40+ 个 DOM 操作方法：
- **查询方法**: querySelector, querySelectorAll
- **内容方法**: setHTML, setText, getHTML, getText
- **属性方法**: setAttribute, getAttribute, setAttributes, getAttributes
- **样式方法**: setStyle, getStyle, setStyles
- **类方法**: addClass, removeClass, toggleClass, hasClass
- **事件方法**: addEventListener, removeEventListener, dispatchEvent
- **位置方法**: getBoundingClientRect, getSize, getPosition
- **DOM 操作**: appendChild, removeChild, insertBefore, replaceChild
- **Shadow DOM 支持**: getShadowRoot, queryShadow, queryShadowAll

#### 2. BaseComponent 扩展 (`src/core/BaseComponent.ts`)
每个组件实例都继承这些方法：
```typescript
// 直接在组件实例上调用
component.querySelector('.child');
component.setText('New text');
component.addClass('active');
component.on('click', handler);
component.getSize();
// 等等
```

### API 特性

#### 多层次访问

**通过组件实例**:
```typescript
const button = new Button();
button.mount(container);
button.setText('Click me');
button.on('click', () => {});
```

**通过 DOMAccessor 静态方法**:
```typescript
const element = document.getElementById('my-btn');
DOMAccessor.setText(element, 'Click me');
DOMAccessor.addEventListener(element, 'click', () => {});
```

**通过获取的元素**:
```typescript
const component = new Button();
component.mount(container);
const el = component.getElement();
el?.addEventListener('click', () => {});
```

#### Shadow DOM 支持
即使组件使用了 Shadow DOM 隔离，用户仍可以访问：
```typescript
const component = new StyledComponent();
component.mount(container);

// 获取 Shadow DOM
const shadowRoot = component.getShadowRoot();

// 在 Shadow DOM 中查询
const child = component.queryShadow('.shadow-child');
const children = component.queryShadowAll('span');
```

#### 完整的事件支持
```typescript
component.on('click', handler);      // 添加
component.off('click', handler);     // 移除
component.emit('custom', data);      // 触发自定义事件
```

#### 数据属性管理
```typescript
component.setData('userId', 123);
component.getDataValue('userId');    // 123
component.getData();                 // { userId: '123' }
```

## 集成与兼容性

### 与样式隔离的整合
- Shadow DOM 提供样式隔离
- 用户仍可以通过 DOMAccessor 访问隐藏的元素
- 支持在 Shadow DOM 内部添加/修改样式

### 与事件系统的整合
- BaseComponent 的事件方法与事件委托兼容
- GlobalEventSystem 可以与原生事件监听共存
- 支持自定义事件触发和监听

### 与状态管理的整合
- DOM 操作独立于状态管理
- 用户可以直接修改 DOM，不影响内部状态
- 支持响应式更新和手动 DOM 操纵的混合使用

## 安全考虑

### XSS 防护
推荐使用 `setText()` 而不是 `setHTML()` 来防止注入攻击：
```typescript
// 安全
component.setText(userInput);

// 需谨慎
component.setHTML(userInput);
```

### 元素验证
所有 DOMAccessor 方法都进行 null 检查，防止错误传播：
```typescript
DOMAccessor.addClass(null, 'class');     // 安全，无操作
DOMAccessor.setText(undefined, 'text');  // 安全，无操作
```

## 使用场景

### 1. 表单验证反馈
```typescript
input.on('blur', () => {
  if (!isValid(input.getText())) {
    input.addClass('error');
    input.setAttribute('aria-invalid', 'true');
  }
});
```

### 2. 动态内容加载
```typescript
const list = new Container();
list.mount(document.body);

async function loadItems() {
  const items = await fetchItems();
  list.clear();
  items.forEach(item => {
    const el = DOMAccessor.createElement(`<div>${item.name}</div>`);
    if (el) list.appendChild(el);
  });
}
```

### 3. 第三方库集成
```typescript
const editor = new Container();
editor.mount(container);

// 集成富文本编辑器
const quill = new Quill(editor.getElement(), { /* options */ });
```

### 4. 响应式设计
```typescript
const box = new Container();
box.mount(container);

window.addEventListener('resize', () => {
  const size = box.getSize();
  if (size.width < 600) {
    box.addClass('mobile');
  } else {
    box.removeClass('mobile');
  }
});
```

## 在项目计划中的位置

此功能已经落地到当前代码库，并且贯穿多个模块：

### Phase 1: 核心基础
- ✅ 已实现 `DOMAccessor` 类
- ✅ 已扩展 `BaseComponent`
- ✅ 已导出相关 API

### Phase 2-7: 持续优化
- 每个组件都可通过 `BaseComponent` 的实例方法访问 DOM
- 现有组件无需额外适配即可使用这些 API

### 文档和示例
- DOM_ACCESS_GUIDE.md - 完整使用指南
- 代码示例和最佳实践
- API 参考文档

## 总结

这个 DOM 访问层是 PortableUi 现有实现中的关键特性，它：

✅ **赋予用户完全的灵活性** - 可以访问和修改任何 DOM 元素  
✅ **保持 API 简洁** - 直观的方法名和清晰的参数  
✅ **兼容现有代码** - 与任何 JavaScript 库无缝集成  
✅ **维持安全性** - 内置防护和最佳实践指导  
✅ **支持样式隔离** - 在 Shadow DOM 隔离内仍可访问  
✅ **遵循 Web 标准** - 使用标准 DOM API 和事件系统

项目已支持从库外部直接访问和修改 DOM。

