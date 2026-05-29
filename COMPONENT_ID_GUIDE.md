# 组件ID指南

This guide explains how to use component IDs in PortableUi.

## 概述

从此版本开始，每个组件都自动拥有一个唯一的ID。这个ID可以用来：
- 直接查询特定的组件数据
- 在容器中通过ID定位组件
- 通过ID获取组件对应的DOM元素

## 自动ID生成

如果您没有为组件指定ID，框架会自动生成一个ID，格式为：
```
{ComponentName}_{randomString}
```

例如：
- `Button_a1b2c3d4e`
- `Input_f5g6h7i8j`
- `Container_k9l0m1n2o`

### 示例

```typescript
// 不指定ID，自动生成
const button = new Button({ text: 'Click me' });
console.log(button.getId()); // 输出: Button_a1b2c3d4e

// 指定ID
const customButton = new Button({ 
  id: 'submit-btn',
  text: 'Submit' 
});
console.log(customButton.getId()); // 输出: submit-btn
```

## 查询组件

### 方式1：通过组件实例获取ID

```typescript
const button = new Button({ text: 'Click' });
button.mount(container);
const id = button.getId();
```

### 方式2：在容器作用域通过ID获取组件实例

```typescript
// 挂载组件
const button = new Button({ text: 'Click' });
button.mount(container);

// 在容器作用域通过ID获取组件
const resolvedButton = BaseComponent.queryComponentById<Button>(container, button.getId());
if (resolvedButton instanceof Button) {
  resolvedButton.setText('Updated');
}
```

### 方式3：在容器作用域通过ID获取DOM元素

```typescript
const button = new Button({ text: 'Click' });
button.mount(container);

// 在容器作用域获取DOM元素
const element = BaseComponent.queryElementById(container, button.getId());
if (element) {
  element.style.backgroundColor = 'blue';
}
```

### 方式4：在组件实例范围内查询

```typescript
const form = new Container({ /* ... */ });
form.mount(appElement);

const nameInput = form.findComponentById<Input>('name-input');
nameInput?.focus();
```

## 在容器组件中使用

```typescript
const container = new Container({
  children: [
    new Button({ id: 'btn-ok', text: 'OK' }),
    new Button({ id: 'btn-cancel', text: 'Cancel' }),
    new Input({ id: 'name-input', placeholder: 'Enter name' })
  ]
});

container.mount(appElement);

// 通过ID查询和修改组件
const okButton = BaseComponent.queryComponentById<Button>(appElement, 'btn-ok');
const nameInput = BaseComponent.queryComponentById<Input>(appElement, 'name-input');

// 使用组件方法
if (okButton instanceof Button) {
  okButton.setDisabled(true);
}
if (nameInput instanceof Input) {
  nameInput.setValue('John');
  nameInput.focus();
}
```

## 在事件处理中使用

```typescript
const button = new Button({
  text: 'Click',
  onClick: (self, event) => {
    const componentId = self.getId();
    console.log(`Button ${componentId} was clicked`);
    
    // 通过ID获取其他相关组件
    const relatedComponent = BaseComponent.queryComponentById(appElement, 'some-other-id');
  }
});
```

## 最佳实践

1. **为重要组件指定语义化ID**
   ```typescript
   new Button({ id: 'submit-button', text: 'Submit' })
   new Input({ id: 'email-field', placeholder: 'Email' })
   ```

2. **使用ID来实现组件间通信**
   ```typescript
   const form = new Container({
     children: [
       new Input({ id: 'password', type: 'password' }),
       new Button({
         id: 'show-password',
         text: 'Show',
         onClick: () => {
           const pwdInput = BaseComponent.queryComponentById<Input>(document.body, 'password');
           if (pwdInput instanceof Input) {
             // 切换密码可见性
           }
         }
       })
     ]
   });
   ```

3. **在组件卸载后按作用域查询**
   ```typescript
   button.unmount();
   BaseComponent.queryComponentById(document.body, button.getId()); // null
   ```

## API 参考

### 组件实例方法

- `getId(): string` - 获取组件ID

### 查询方法

- `BaseComponent.queryComponentById(container: ParentNode | null, id: string): BaseComponent | null` - 在容器作用域获取组件
- `BaseComponent.queryElementById(container: ParentNode | null, id: string): HTMLElement | null` - 在容器作用域获取元素
- `findComponentById(id: string): BaseComponent | null` - 在当前组件根元素范围查询组件
- `findElementById(id: string): HTMLElement | null` - 在当前组件根元素范围查询元素

## 注意事项

1. 自动生成的IDs会在每次创建新的同类型组件时生成，因此可能不稳定
2. 对于需要持久化查询的组件，建议显式指定ID
3. 组件卸载后将不在对应容器作用域内可查
4. 重复的ID在同一作用域内会导致匹配歧义

