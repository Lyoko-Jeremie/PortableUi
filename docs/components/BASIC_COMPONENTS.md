# 基础组件 API 文档

本文档涵盖 `src/components/basic/` 下所有 10 个基础组件的完整 API 参考。

所有基础组件均继承自 [`BaseComponent`](../core/BASE_COMPONENT.md)，因此共享通用的生命周期方法、DOM 访问 API 和样式操作 API。

---

## 目录

- [通用概念](#通用概念)
  - [ComponentProps（公共属性）](#componentprops公共属性)
  - [生命周期](#生命周期)
  - [挂载与卸载](#挂载与卸载)
- [Button 按钮](#button-按钮)
- [Input 文本输入框](#input-文本输入框)
- [Label 标签](#label-标签)
- [TextBox 多行文本框](#textbox-多行文本框)
- [Select 下拉框](#select-下拉框)
- [Checkbox 复选框](#checkbox-复选框)
- [Radio 单选框](#radio-单选框)
- [Slider 滑动条](#slider-滑动条)
- [DatePicker 日期选择器](#datepicker-日期选择器)
- [FileUpload 文件上传](#fileupload-文件上传)

---

## 通用概念

### ComponentProps（公共属性）

所有组件的 `props` 都继承自 `ComponentProps`，以下属性对所有组件通用：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | — | 元素 `id` 属性 |
| `className` | `string` | — | 附加 CSS 类名（会与组件默认类名合并） |
| `style` | `Record<string, string>` | — | 内联样式对象 |

### 生��周期

通过 `BaseComponent` 构造函数的第二个参数传入生命周期钩子：

```ts
const btn = new Button({ text: 'OK' }, {
  onMount:   (self) => console.log('mounted',   self),
  onUpdate:  (self) => console.log('updated',   self),
  onUnmount: (self) => console.log('unmounted', self),
  onError:   (self, err) => console.error(err),
});
```

> **注意**：各组件子类的构造函数签名可能只暴露 `props` 参数。若需生命周期钩子，请直接继承并扩展组件类。

### 挂载与卸载

```ts
const btn = new Button({ text: 'Click' });

// 挂载到 DOM
btn.mount(document.body);   // 将元素 appendChild 到 container

// 检查状态
btn.isMounted();            // true

// 更新属性（已挂载时自动重渲染）
btn.update({ text: 'Updated' });

// 卸载并移除 DOM 元素
btn.unmount();

// 销毁（卸载 + 清空 props/state）
btn.destroy();
```

---

## Button 按钮

**导入**

```ts
import { Button, ButtonProps } from 'PortableUi';
```

**渲染元素**：`<button class="portableui-button">`

### ButtonProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `''` | 按钮显示文字 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生 type 属性 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `onClick` | `(self: Button, event: MouseEvent) => void` | — | 点击回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `setText` | `(text: string) => void` | 更新按钮文字 |
| `setDisabled` | `(disabled: boolean) => void` | 启用/禁用按钮 |

### 示例

```ts
const btn = new Button({
  text: '提交',
  type: 'submit',
  onClick: (self, e) => {
    self.setDisabled(true);
    self.setText('提交中...');
    console.log('clicked', e);
  },
});
btn.mount(document.body);
```

---

## Input 文本输入框

**导入**

```ts
import { Input, InputProps } from 'PortableUi';
```

**渲染元素**：`<input class="portableui-input">`

### InputProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'search' \| 'tel' \| 'url'` | `'text'` | 输入类型 |
| `value` | `string` | `''` | 初始值 |
| `placeholder` | `string` | `''` | 占位提示文字 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `required` | `boolean` | `false` | 是否必填 |
| `name` | `string` | — | 表单字段名 |
| `autocomplete` | `string` | — | 自动完成提示 |
| `minLength` | `number` | — | 最小字符数 |
| `maxLength` | `number` | — | 最大字符数 |
| `onInput` | `(self: Input, event: Event, value: string) => void` | — | 输入时回调 |
| `onChange` | `(self: Input, event: Event, value: string) => void` | — | 失焦/确认时回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getValue` | `() => string` | 获取当前值 |
| `setValue` | `(value: string) => void` | 设置值并重渲染 |
| `focus` | `() => void` | 聚焦 |
| `blur` | `() => void` | 失焦 |

### 示例

```ts
const input = new Input({
  type: 'email',
  placeholder: '请输入邮箱',
  required: true,
  onInput: (_self, _e, value) => console.log('typing:', value),
  onChange: (_self, _e, value) => console.log('committed:', value),
});
input.mount(document.body);

// 读取当前值
const value = input.getValue();
```

---

## Label 标签

**导入**

```ts
import { Label, LabelProps } from 'PortableUi';
```

**渲染元素**：`<label class="portableui-label">`

### LabelProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `''` | 标签文字 |
| `htmlFor` | `string` | — | 关联的表单控件 id |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `setText` | `(text: string) => void` | 更新标签文字 |

### 示例

```ts
const input = new Input({ id: 'username', placeholder: '用户名' });
const label = new Label({ text: '用户名：', htmlFor: 'username' });

label.mount(document.body);
input.mount(document.body);
```

---

## TextBox 多行文本框

**导入**

```ts
import { TextBox, TextBoxProps } from 'PortableUi';
```

**渲染元素**：`<textarea class="portableui-textbox">`

### TextBoxProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 初始值 |
| `placeholder` | `string` | `''` | 占位提示文字 |
| `rows` | `number` | `4` | 行数 |
| `cols` | `number` | `30` | 列数 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `required` | `boolean` | `false` | 是否必填 |
| `resize` | `'none' \| 'both' \| 'horizontal' \| 'vertical'` | — | 缩放方向 |
| `onInput` | `(self: TextBox, event: Event, value: string) => void` | — | 输入时回调 |
| `onChange` | `(self: TextBox, event: Event, value: string) => void` | — | 失焦/确认时回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getValue` | `() => string` | 获取当前内容 |
| `setValue` | `(value: string) => void` | 设置内容并重渲染 |

### 示例

```ts
const tb = new TextBox({
  placeholder: '请输入详细描述...',
  rows: 6,
  resize: 'vertical',
  onChange: (_self, _e, value) => console.log('content:', value),
});
tb.mount(document.body);
```

---

## Select 下拉框

**导入**

```ts
import { Select, SelectProps, SelectOption } from 'PortableUi';
```

**渲染元素**：`<select class="portableui-select">`

### SelectOption

```ts
interface SelectOption {
  label: string;      // 显示文字
  value: string;      // 选项值
  disabled?: boolean; // 是否禁用该选项
}
```

### SelectProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `SelectOption[]` | `[]` | 选项列表 |
| `value` | `string \| string[]` | — | 默认选中值（多选时为数组） |
| `multiple` | `boolean` | `false` | 是否多选 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `required` | `boolean` | `false` | 是否必选 |
| `name` | `string` | — | 表单字段名 |
| `placeholder` | `string` | — | 占位选项文字（单选模式） |
| `onChange` | `(self: Select, event: Event, value: string \| string[]) => void` | — | 选中变化回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getValue` | `() => string \| string[]` | 获取当前选中值 |
| `setValue` | `(value: string \| string[]) => void` | 设置选中值 |
| `setOptions` | `(options: SelectOption[]) => void` | 替换选项列表 |

### 示例

```ts
const select = new Select({
  placeholder: '请选择城市',
  options: [
    { label: '北京', value: 'beijing' },
    { label: '上海', value: 'shanghai' },
    { label: '广州', value: 'guangzhou' },
    { label: '香港（暂停服务）', value: 'hongkong', disabled: true },
  ],
  onChange: (_self, _e, value) => console.log('selected:', value),
});
select.mount(document.body);

// 动态更新选项
select.setOptions([{ label: '深圳', value: 'shenzhen' }]);
```

**多选示例**

```ts
const multi = new Select({
  multiple: true,
  options: [
    { label: '篮球', value: 'basketball' },
    { label: '足球', value: 'football' },
    { label: '游泳', value: 'swimming' },
  ],
  value: ['basketball', 'swimming'], // 默认选中两项
  onChange: (_self, _e, values) => console.log('selected:', values), // values: string[]
});
multi.mount(document.body);
```

---

## Checkbox 复选框

**导入**

```ts
import { Checkbox, CheckboxProps } from 'PortableUi';
```

**渲染结构**：`<label class="portableui-checkbox"><input type="checkbox"><span>label</span></label>`

### CheckboxProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | `false` | 是否选中 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `required` | `boolean` | `false` | 是否必选 |
| `name` | `string` | — | 表单字段名 |
| `value` | `string` | — | 提交表单时的值 |
| `label` | `string` | `''` | 复选框旁显示的文字 |
| `indeterminate` | `boolean` | `false` | 半选状态（不确定） |
| `onChange` | `(self: Checkbox, event: Event, checked: boolean) => void` | — | 状态变化回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `isChecked` | `() => boolean` | 获取当前选中状态 |
| `setChecked` | `(checked: boolean) => void` | 设置选中状态 |

### 示例

```ts
const cb = new Checkbox({
  label: '我已阅读并同意用户协议',
  name: 'agree',
  value: 'yes',
  onChange: (_self, _e, checked) => {
    submitBtn.setDisabled(!checked);
  },
});
cb.mount(document.body);

// 半选（常用于全选/部分选场景）
cb.update({ indeterminate: true });
```

---

## Radio 单选框

**导入**

```ts
import { Radio, RadioProps } from 'PortableUi';
```

**渲染结构**：`<label class="portableui-radio"><input type="radio"><span>label</span></label>`

### RadioProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | `false` | 是否选中 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `required` | `boolean` | `false` | 是否必选 |
| `name` | `string` | — | **分组名**（同 name 的单选框互斥） |
| `value` | `string` | — | 该选项的值 |
| `label` | `string` | `''` | 单选框旁显示的文字 |
| `onChange` | `(self: Radio, event: Event, checked: boolean) => void` | — | 状态变化回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `isChecked` | `() => boolean` | 获取当前选中状态 |
| `setChecked` | `(checked: boolean) => void` | 设置选中状态 |

### 示例

```ts
const group = ['男', '女', '不愿透露'].map((label, i) =>
  new Radio({
    name: 'gender',
    label,
    value: String(i),
    checked: i === 0,
    onChange: (_self, _e, checked) => {
      if (checked) console.log('selected gender:', label);
    },
  })
);

const container = document.createElement('div');
document.body.appendChild(container);
group.forEach(r => r.mount(container));
```

---

## Slider 滑动条

**导入**

```ts
import { Slider, SliderProps } from 'PortableUi';
```

**渲染结构**：`<div class="portableui-slider"><input type="range"><span class="portableui-slider-value">…</span></div>`

### SliderProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长 |
| `value` | `number` | `min` | 初始值 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `showValue` | `boolean` | `true` | 是否在旁边显示当前值 |
| `onInput` | `(self: Slider, event: Event, value: number) => void` | — | 拖动时实时回调 |
| `onChange` | `(self: Slider, event: Event, value: number) => void` | — | 释放后确认回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getValue` | `() => number` | 获取当前数值 |
| `setValue` | `(value: number) => void` | 设置数值并重渲染 |

### 示例

```ts
const slider = new Slider({
  min: 0,
  max: 200,
  step: 10,
  value: 50,
  onInput: (_self, _e, value) => console.log('dragging:', value),
  onChange: (_self, _e, value) => console.log('final:', value),
});
slider.mount(document.body);

// 编程式设置值
slider.setValue(120);
console.log(slider.getValue()); // 120
```

---

## DatePicker 日期选择器

**导入**

```ts
import { DatePicker, DatePickerProps } from 'PortableUi';
```

**渲染元素**：`<input type="date" class="portableui-date-picker">`

> 日期值格式遵循 `YYYY-MM-DD`（ISO 8601）。

### DatePickerProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 初始日期（`YYYY-MM-DD`） |
| `min` | `string` | — | 最早可选日期（`YYYY-MM-DD`） |
| `max` | `string` | — | 最晚可选日期（`YYYY-MM-DD`） |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `required` | `boolean` | `false` | 是否必填 |
| `onChange` | `(self: DatePicker, event: Event, value: string) => void` | — | 日期变化回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getValue` | `() => string` | 获取当前日期字符串 |
| `setValue` | `(value: string) => void` | 设置日期并重渲染 |

### 示例

```ts
const dp = new DatePicker({
  value: '2026-01-01',
  min: '2025-01-01',
  max: '2026-12-31',
  onChange: (_self, _e, value) => console.log('date:', value),
});
dp.mount(document.body);

// 读取所选日期
const date = dp.getValue(); // e.g. '2026-05-30'
```

---

## FileUpload 文件上传

**导入**

```ts
import { FileUpload, FileUploadProps } from 'PortableUi';
```

**渲染元素**：`<input type="file" class="portableui-file-upload">`

### FileUploadProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `accept` | `string` | — | 允许的文件类型，如 `'image/*'`、`'.pdf,.doc'` |
| `multiple` | `boolean` | `false` | 是否允许多文件选择 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `capture` | `string` | — | 移动端摄像头/麦克风捕获，如 `'environment'` |
| `onChange` | `(self: FileUpload, event: Event, files: File[]) => void` | — | 文件选择回调 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getFiles` | `() => File[]` | 获取已选文件列表 |
| `clearFiles` | `() => void` | 清空已选文件 |

### 示例

```ts
const uploader = new FileUpload({
  accept: 'image/png, image/jpeg',
  multiple: true,
  onChange: (_self, _e, files) => {
    files.forEach(f => console.log(f.name, f.size));
  },
});
uploader.mount(document.body);

// 清空选择
uploader.clearFiles();
```

**移动端摄像头直接拍照**

```ts
const camera = new FileUpload({
  accept: 'image/*',
  capture: 'environment', // 后置摄像头
});
camera.mount(document.body);
```

---

## 通用 DOM 访问 API（继承自 BaseComponent）

以下方法在所有组件上均可用：

```ts
const btn = new Button({ text: 'Test' });
btn.mount(document.body);

// 元素查询
btn.querySelector('.child');        // HTMLElement | null
btn.querySelectorAll('span');       // HTMLElement[]
btn.getChildren();                  // HTMLElement[]
btn.getParent();                    // HTMLElement | null

// 内容操作
btn.getHTML();                      // string
btn.setHTML('<b>bold</b>');
btn.getText();                      // string

// 属性操作
btn.setAttribute('aria-label', 'OK');
btn.getAttribute('aria-label');     // 'OK'
btn.removeAttribute('aria-label');
btn.setAttributes({ role: 'button', tabIndex: '0' });
btn.getAttributes();                // Record<string, string>

// 样式操作
btn.setStyle('color', 'red');
btn.getStyle('color');              // 'red'
btn.setStyles({ color: 'blue', fontWeight: 'bold' });
btn.addClass('active');
btn.removeClass('active');
btn.toggleClass('active');
btn.hasClass('active');             // boolean
btn.getClasses();                   // string[]

// 事件
btn.on('mouseenter', () => console.log('hover'));
btn.off('mouseenter', handler);
btn.emit('custom-event', { detail: 123 });

// 几何信息
btn.getBounds();                    // DOMRect | null
btn.getSize();                      // { width, height }
btn.getPosition();                  // { top, left }
btn.isVisible();                    // boolean

// 数据属性
btn.setData('index', 0);
btn.getData();                      // Record<string, any>
btn.getDataValue('index');          // 0

// 其他
btn.clone();                        // HTMLElement | null
btn.clear();                        // 清空内容
btn.remove();                       // 从 DOM 移除元素本身
```

