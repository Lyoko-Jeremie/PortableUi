# DOM 访问和修改指南

## 概述

PortableUi 提供全面的 DOM 访问和修改 API，允许用户从库外部直接访问和修改组件所生成的 DOM 元素。这是一个强大的特性，特别是在需要精细控制 UI 的场景中。

## API 类别

### 1. 元素获取和查询

#### 从组件获取元素

```typescript
import { Button } from 'PortableUi';

// 创建并挂载组件
const button = new Button({ label: 'Click me' });
button.mount(document.body);

// 直接获取 DOM 元素
const element = button.getElement();

// 查询子元素
const firstChild = button.querySelector('.some-class');
const allChildren = button.querySelectorAll('span');

// 获取直接子元素
const children = button.getChildren();

// 获取父元素
const parent = button.getParent();
```

#### 使用 DOMAccessor 独立访问

```typescript
import { DOMAccessor } from 'PortableUi';

const element = document.getElementById('my-btn');

// 查询
const child = DOMAccessor.querySelector(element, '.child');
const children = DOMAccessor.querySelectorAll(element, 'p');
```

### 2. 内容和文本操作

```typescript
const btn = new Button({ label: 'Original' });
btn.mount(document.body);

// 设置 HTML 内容
btn.setHTML('<strong>Bold text</strong>');

// 获取 HTML 内容
const html = btn.getHTML();

// 设置文本 - 安全的文本设置（防止 XSS）
btn.setText('Safe text');

// 获取文本
const text = btn.getText();
```

### 3. 属性管理

```typescript
const input = new Input();
input.mount(document.body);

// 设置单个属性
input.setAttribute('placeholder', 'Enter text...');
input.setAttribute('disabled', 'true');

// 获取属性
const placeholder = input.getAttribute('placeholder');

// 移除属性
input.removeAttribute('disabled');

// 批量设置属性
input.setAttributes({
  'data-test': 'value',
  'aria-label': 'Test input',
  placeholder: 'Try typing...'
});

// 获取所有属性
const attrs = input.getAttributes();
```

### 4. 样式管理

```typescript
const box = new Container();
box.mount(document.body);

// 设置单个样式
box.setStyle('background-color', 'red');
box.setStyle('font-size', '16px');
box.setStyle('border-radius', '8px');

// 获取计算后的样式
const bgColor = box.getStyle('background-color');
const fontSize = box.getStyle('font-size');

// 批量设置样式
box.setStyles({
  'background-color': 'blue',
  'padding': '10px',
  'margin': '5px'
});
```

### 5. CSS 类操作

```typescript
const panel = new Container();
panel.mount(document.body);

// 添加单个类或多个类
panel.addClass('active');
panel.addClass('light-theme dark-background'); // 添加两个类

// 移除类
panel.removeClass('active');
panel.removeClass('light-theme dark-background');

// 切换类
panel.toggleClass('active'); // 添加或移除
panel.toggleClass('disabled', true); // 强制添加
panel.toggleClass('disabled', false); // 强制移除

// 检查是否拥有类
if (panel.hasClass('active')) {
  console.log('Panel is active');
}

// 获取所有类
const classes = panel.getClasses(); // ['class1', 'class2']

// 设置所有类（替换）
panel.setClasses(['new-class', 'another-class']);
```

### 6. 事件处理

```typescript
const button = new Button({ label: 'Click me' });
button.mount(document.body);

// 添加事件监听
button.on('click', (e: Event) => {
  console.log('Button clicked', e);
});

// 添加事件监听（带选项）
button.on('change', (e: Event) => {
  console.log('Changed', e);
}, { once: true }); // 只执行一次

// 移除事件监听
const handler = (e: Event) => console.log('Clicked');
button.on('click', handler);
button.off('click', handler);

// 触发自定义事件
button.emit('custom-event', { data: 'some value' });

// 监听自定义事件
document.getElementById('my-container').addEventListener('custom-event', (e: any) => {
  console.log('Custom event received:', e.detail);
});
```

### 7. DOM 树操作

```typescript
const container = new Container();
container.mount(document.body);

// 添加子元素
const child = document.createElement('div');
child.textContent = 'Child element';
container.appendChild(child);

// 移除子元素
container.removeChild(child);

// 插入元素
const sibling = document.createElement('p');
container.insertBefore(sibling); // 在容器前插入

const after = document.createElement('p');
container.insertAfter(after); // 在容器后插入

// 替换元素
const newElement = document.createElement('div');
container.replaceChild(newElement);

// 清空内容
container.clear();

// 移除元素本身
container.remove(); // 从 DOM 中移除
```

### 8. 位置和尺寸

```typescript
const box = new Container();
box.mount(document.body);

// 获取完整的位置和尺寸信息
const bounds = box.getBounds(); // DOMRect
console.log(bounds.top, bounds.left, bounds.width, bounds.height);

// 获取尺寸
const size = box.getSize(); // { width, height }

// 获取位置
const pos = box.getPosition(); // { top, left }

// 检查是否可见
if (box.isVisible()) {
  console.log('Element is visible');
}
```

### 9. Shadow DOM 访问

```typescript
// 如果组件使用了样式隔离（Shadow DOM）
const component = new SomeComponent();
component.mount(document.body);

// 获取 Shadow DOM 根
const shadowRoot = component.getShadowRoot();

if (shadowRoot) {
  console.log('This component uses Shadow DOM');
  
  // 在 Shadow DOM 中查询元素
  const shadowChild = component.queryShadow('.shadow-element');
  const shadowChildren = component.queryShadowAll('div');
}
```

### 10. 数据属性

```typescript
const element = new Input();
element.mount(document.body);

// 设置数据属性
element.setData('userId', '12345');
element.setData('isAdmin', 'true');

// 获取所有数据属性
const allData = element.getData();
// { userId: '12345', isAdmin: 'true' }

// 获取单个数据属性
const userId = element.getDataValue('userId'); // '12345'

// 在 HTML 中访问：
// <div data-user-id="12345" data-is-admin="true"></div>
```

### 11. 元素克隆

```typescript
const button = new Button({ label: 'Original' });
button.mount(document.body);

// 克隆元素（深度克隆 - 包含所有子节点）
const cloned = button.clone(); // 相当于 clone(true)

// 浅度克隆 - 只克隆元素本身
const shallowClone = button.clone(false);

// 将克隆元素添加到 DOM
if (cloned && cloned.parentElement) {
  cloned.parentElement.appendChild(cloned);
}
```

### 12. 元素包含检查

```typescript
const parent = new Container();
const child = new Button();
parent.appendChild(child.getElement());

// 检查包含关系
if (parent.getElement()?.contains(child.getElement())) {
  console.log('Button is inside Container');
}
```

## 使用 DOMAccessor 的静态方法

如果不是通过组件实例操作，可以直接使用 `DOMAccessor` 的静态方法：

```typescript
import { DOMAccessor } from 'PortableUi';

const el = document.getElementById('my-element');

// 查询
DOMAccessor.querySelector(el, '.child');
DOMAccessor.querySelectorAll(el, 'p');

// 属性
DOMAccessor.setAttribute(el, 'disabled', 'true');
DOMAccessor.getAttribute(el, 'disabled');

// 样式
DOMAccessor.setStyle(el, 'color', 'red');
DOMAccessor.getStyle(el, 'color');

// 类
DOMAccessor.addClass(el, 'active');
DOMAccessor.hasClass(el, 'active');

// 事件
DOMAccessor.addEventListener(el, 'click', (e) => {
  console.log('Clicked');
});

// CSS 创建
const newEl = DOMAccessor.createElement('<div>Hello</div>');
```

## 实际应用示例

### 示例 1: 表单验证和样式反馈

```typescript
import { Input, Button } from 'PortableUi';

const email = new Input({ placeholder: 'Enter email' });
const submitBtn = new Button({ label: 'Submit' });

email.mount(document.body);
submitBtn.mount(document.body);

// 添加验证
submitBtn.on('click', () => {
  const value = email.getText();
  
  if (!value.includes('@')) {
    email.addClass('error');
    email.setAttribute('aria-invalid', 'true');
  } else {
    email.removeClass('error');
    email.setAttribute('aria-invalid', 'false');
  }
});
```

### 示例 2: 动态内容更新

```typescript
import { Container } from 'PortableUi';

const list = new Container();
list.mount(document.body);

function addItem(text) {
  const item = document.createElement('li');
  item.textContent = text;
  list.appendChild(item);
}

// 添加多个项
addItem('Item 1');
addItem('Item 2');
addItem('Item 3');

// 清空所有项
list.clear();
```

### 示例 3: 交互式样式切换

```typescript
import { Container } from 'PortableUi';

const panel = new Container();
panel.mount(document.body);

const themes = ['light', 'dark', 'auto'];
let currentTheme = 0;

panel.on('click', () => {
  panel.removeClass(themes[currentTheme]);
  currentTheme = (currentTheme + 1) % themes.length;
  panel.addClass(themes[currentTheme]);
});
```

### 示例 4: 获取用户输入

```typescript
import { Input, Button, Container } from 'PortableUi';

const container = new Container();
container.mount(document.body);

const input = new Input({ placeholder: 'Your name' });
const btn = new Button({ label: 'Greet' });

container.appendChild(input.getElement());
container.appendChild(btn.getElement());

btn.on('click', () => {
  const name = input.getText();
  console.log(`Hello, ${name}!`);
});
```

## 最佳实践

### 1. 检查空值

```typescript
const element = button.querySelector('.optional-child');
if (element) {
  // 安全地操作
  element.textContent = 'Updated';
}
```

### 2. 避免 XSS 攻击

```typescript
// ❌ 不推荐 - 容易造成 XSS 漏洞
component.setHTML(userInput);

// ✅ 推荐 - 使用文本设置
component.setText(userInput);
```

### 3. 使用数据属性存储关联数据

```typescript
const item = new Container();
item.setData('itemId', productId);
item.setData('price', price);

item.on('click', () => {
  const id = item.getDataValue('itemId');
  const price = item.getDataValue('price');
  // 进行操作
});
```

### 4. 性能优化

```typescript
// ❌ 低效 - 多次重排
for (let i = 0; i < 1000; i++) {
  component.setStyle('width', i + 'px');
}

// ✅ 高效 - 批量操作
let style = '';
for (let i = 0; i < 1000; i++) {
  style += `width: ${i}px;`;
}
component.setHTML(style); // 或使用其他批处理方法
```

### 5. 事件委托

```typescript
const list = new Container();
list.mount(document.body);

// 在容器级别监听事件，适用于所有子元素
list.on('click', (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('item')) {
    console.log('Item clicked:', target.textContent);
  }
});
```

## 总结

PortableUi 的 DOM 访问 API 让您可以：

- ✅ 灵活访问和修改组件生成的 DOM
- ✅ 在组件外部无限制地操纵 UI
- ✅ 与现有 JavaScript 代码集成
- ✅ 实现复杂的交互效果
- ✅ 进行动态内容更新

这种设计理念符合 PortableUi 的目标：提供**易用性**和**灵活性**，让开发者能够快速创建功能丰富的用户界面。

