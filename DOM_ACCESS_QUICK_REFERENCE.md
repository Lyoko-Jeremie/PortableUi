# DOM 访问 API 快速参考

## 快速开始

### 基础用法

```typescript
import { Button, DOMAccessor } from 'PortableUi';

// 创建组件
const btn = new Button({ label: 'Click' });
btn.mount(document.body);

// 直接操作 DOM
btn.setText('Click me');
btn.addClass('primary');
btn.on('click', () => console.log('Clicked'));
```

## API 总览

### 通过组件实例调用

所有 `BaseComponent` 的子类都可以直接调用这些方法：

```typescript
component.setText(text)              // 设置文本
component.getText()                  // 获取文本
component.setHTML(html)              // 设置 HTML
component.getHTML()                  // 获取 HTML
component.setAttribute(name, value)  // 设置属性
component.getAttribute(name)         // 获取属性
component.setStyle(prop, value)      // 设置样式
component.getStyle(prop)             // 获取样式
component.addClass(name)             // 添加类
component.removeClass(name)          // 移除类
component.toggleClass(name)          // 切换类
component.hasClass(name)             // 检查类
component.on(event, handler)         // 监听事件
component.off(event, handler)        // 移除监听
component.emit(eventName, data)      // 触发事件
component.appendChild(element)       // 添加子元素
component.removeChild(element)       // 移除子元素
component.querySelector(selector)    // 查询子元素
component.querySelectorAll(selector) // 查询多个子元素
component.getChildren()              // 获取所有子元素
component.clear()                    // 清空内容
component.remove()                   // 移除自己
component.clone(deep)                // 克隆元素
component.getBounds()                // 获取位置/尺寸信息
component.getSize()                  // 获取尺寸
component.getPosition()              // 获取位置
component.isVisible()                // 检查可见性
component.getShadowRoot()            // 获取 Shadow DOM
component.queryShadow(selector)      // Shadow DOM 查询
component.setData(key, value)        // 设置数据属性
component.getData()                  // 获取所有数据属性
```

### 通过 DOMAccessor 静态方法

如果你有一个 DOM 元素（不是组件实例）：

```typescript
import { DOMAccessor } from 'PortableUi';

const el = document.getElementById('my-element');

DOMAccessor.setText(el, 'Text');
DOMAccessor.getText(el);
DOMAccessor.setAttribute(el, 'disabled', 'true');
DOMAccessor.addClass(el, 'active');
// 等等...所有方法都可用
```

## 常见模式

### 1. 内容修改

```typescript
// 设置文本（安全）
component.setText('Hello World');

// 设置 HTML（需谨慎处理用户输入）
component.setHTML('<strong>Bold</strong>');

// 清空内容
component.clear();
```

### 2. 样式操作

```typescript
// 设置单个样式
component.setStyle('color', 'red');
component.setStyle('background-color', '#f0f0f0');

// 批量设置样式
component.setStyles({
  'color': 'blue',
  'font-size': '16px',
  'padding': '10px'
});

// 获取计算样式
const bgColor = component.getStyle('background-color');
```

### 3. CSS 类

```typescript
// 添加类
component.addClass('active');

// 添加多个类
component.addClass('active dark-mode');

// 移除类
component.removeClass('disabled');

// 切换类
component.toggleClass('visible');

// 强制切换
component.toggleClass('hidden', true);  // 添加
component.toggleClass('hidden', false); // 移除

// 检查类
if (component.hasClass('selected')) {
  console.log('Already selected');
}

// 获取所有类
const classes = component.getClasses();  // ['active', 'primary']
```

### 4. 事件处理

```typescript
// 单个事件
component.on('click', (e) => console.log('Clicked'));

// 事件选项
component.on('change', handler, { once: true });

// 移除事件
component.off('click', handler);

// 自定义事件
component.emit('custom-event', { id: 123 });

// 监听自定义事件
component.on('custom-event', (e) => {
  console.log(e.detail); // { id: 123 }
});
```

### 5. DOM 树操作

```typescript
// 添加子元素
const child = document.createElement('div');
component.appendChild(child);

// 移除子元素
component.removeChild(child);

// 在前面插入
component.insertBefore(newElement);

// 在后面插入
component.insertAfter(newElement);

// 替换元素
component.replaceChild(newElement);

// 获取子元素
const children = component.getChildren();
const first = component.querySelector('p');
const all = component.querySelectorAll('span');
```

### 6. 位置和尺寸

```typescript
// 获取完整信息
const bounds = component.getBounds();
console.log(bounds.top, bounds.left, bounds.width, bounds.height);

// 获取尺寸
const { width, height } = component.getSize();

// 获取位置
const { top, left } = component.getPosition();

// 检查可见性
if (component.isVisible()) {
  // 元素在 DOM 中可见
}
```

### 7. 属性管理

```typescript
// 设置属性
component.setAttribute('data-id', '123');
component.setAttribute('disabled', 'true');

// 获取属性
const id = component.getAttribute('data-id');
const disabled = component.getAttribute('disabled');

// 移除属性
component.removeAttribute('disabled');

// 批量设置
component.setAttributes({
  'aria-label': 'Button label',
  'data-test': 'my-button',
  'role': 'button'
});

// 获取所有属性
const attrs = component.getAttributes();
```

### 8. 数据属性

```typescript
// 设置（data-xxx 属性）
component.setData('userId', '12345');
component.setData('role', 'admin');

// 获取单个
const userId = component.getDataValue('userId');

// 获取所有
const data = component.getData();
// { userId: '12345', role: 'admin' }
```

### 9. Shadow DOM

```typescript
// 获取 Shadow DOM 根
const shadowRoot = component.getShadowRoot();

if (shadowRoot) {
  // 在 Shadow DOM 中查询
  const el = component.queryShadow('.shadow-child');
  const els = component.queryShadowAll('p');
}
```

### 10. 元素克隆

```typescript
// 深度克隆
const clone = component.clone();

// 浅度克隆
const shallowClone = component.clone(false);
```

## 实战示例

### 表单验证

```typescript
const input = new Input({ placeholder: 'Email' });
input.mount(container);

input.on('blur', () => {
  const value = input.getText();
  if (!value.includes('@')) {
    input.addClass('error');
    input.setAttribute('aria-invalid', 'true');
  } else {
    input.removeClass('error');
    input.setAttribute('aria-invalid', 'false');
  }
});
```

### 动态列表

```typescript
const list = new Container();
list.mount(container);

function addItem(text) {
  const item = DOMAccessor.createElement(`<li>${text}</li>`);
  if (item) list.appendChild(item);
}

function clearList() {
  list.clear();
}

addItem('Item 1');
addItem('Item 2');
```

### 主题切换

```typescript
const app = new Container();
app.mount(document.body);

const themes = ['light', 'dark', 'auto'];
let currentTheme = 0;

function changeTheme() {
  app.removeClass(themes[currentTheme]);
  currentTheme = (currentTheme + 1) % themes.length;
  app.addClass(themes[currentTheme]);
}
```

### 条件样式

```typescript
const panel = new Container();
panel.mount(container);

function updateUI(state) {
  if (state.loading) {
    panel.addClass('loading');
  } else {
    panel.removeClass('loading');
  }
  
  panel.toggleClass('error', state.hasError);
  panel.toggleClass('success', state.isSuccess);
}
```

## 安全建议

### ✅ 推荐

```typescript
// 使用 setText 处理用户输入
component.setText(userInput);  // 防止 XSS

// 检查空值
const el = component.querySelector('.optional');
if (el) {
  el.textContent = 'Safe';
}

// 使用数据属性存储敏感数据
component.setData('secure', value);
```

### ❌ 避免

```typescript
// 不要直接设置 HTML 用户输入
component.setHTML(userInput);  // 容易被注入

// 不要假设元素存在
component.getElement()?.textContent = 'text';  // 需检查
```

## 性能提示

1. **批量更新** - 多个 DOM 操作时考虑合并
2. **事件委托** - 在容器上监听而不是每个子元素
3. **缓存查询** - 避免重复的 DOM 查询
4. **异步更新** - 大量更新时考虑分批处理

## 完整 API 列表

| 方法 | 说明 |
|-----|------|
| `getElement()` | 获取 DOM 元素 |
| `querySelector(selector)` | 查询单个子元素 |
| `querySelectorAll(selector)` | 查询多个子元素 |
| `getChildren()` | 获取所有直接子元素 |
| `getParent()` | 获取父元素 |
| `setHTML(html)` | 设置 HTML 内容 |
| `getHTML()` | 获取 HTML 内容 |
| `setText(text)` | 设置文本内容 |
| `getText()` | 获取文本内容 |
| `appendChild(child)` | 添加子元素 |
| `removeChild(child)` | 移除子元素 |
| `insertBefore(element)` | 在前插入 |
| `insertAfter(element)` | 在后插入 |
| `replaceChild(element)` | 替换元素 |
| `clear()` | 清空内容 |
| `remove()` | 移除自己 |
| `setAttribute(name, value)` | 设置属性 |
| `getAttribute(name)` | 获取属性 |
| `removeAttribute(name)` | 移除属性 |
| `setAttributes(attrs)` | 批量设置属性 |
| `getAttributes()` | 获取所有属性 |
| `setStyle(prop, value)` | 设置样式 |
| `getStyle(prop)` | 获取样式 |
| `setStyles(styles)` | 批量设置样式 |
| `addClass(name)` | 添加 CSS 类 |
| `removeClass(name)` | 移除 CSS 类 |
| `toggleClass(name, force)` | 切换 CSS 类 |
| `hasClass(name)` | 检查 CSS 类 |
| `getClasses()` | 获取所有 CSS 类 |
| `on(event, handler, options)` | 添加事件监听 |
| `off(event, handler)` | 移除事件监听 |
| `emit(eventName, detail)` | 触发事件 |
| `getBounds()` | 获取 DOMRect |
| `getSize()` | 获取尺寸 |
| `getPosition()` | 获取位置 |
| `isVisible()` | 检查可见性 |
| `getShadowRoot()` | 获取 Shadow DOM |
| `queryShadow(selector)` | Shadow DOM 查询 |
| `queryShadowAll(selector)` | Shadow DOM 多元素查询 |
| `getData()` | 获取数据属性 |
| `setData(key, value)` | 设置数据属性 |
| `getDataValue(key)` | 获取单个数据属性 |
| `clone(deep)` | 克隆元素 |

更多详情见 [DOM_ACCESS_GUIDE.md](./DOM_ACCESS_GUIDE.md) 和 [DOM_ACCESS_REQUIREMENT.md](./DOM_ACCESS_REQUIREMENT.md)

