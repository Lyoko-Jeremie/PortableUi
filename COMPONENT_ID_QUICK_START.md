# 组件ID - 快速参考

## 核心API

### 获取组件ID
```typescript
const id = component.getId();
```

### 查询组件
```typescript
// 通过ID获取组件实例
const component = BaseComponent.getComponentById('my-id');

// 通过ID获取DOM元素
const element = BaseComponent.getElementById('my-id');

// 获取所有已注册的组件
const allComponents = BaseComponent.getAllComponents();
```

## 创建组件

### 自动生成ID（推荐用于临时组件）
```typescript
const button = new Button({ text: 'Click' });
// ID自动生成: Button_a1b2c3d4e
```

### 自定义ID（推荐用于需要查询的组件）
```typescript
const button = new Button({ 
  id: 'my-button',
  text: 'Click' 
});
```

## 常见场景

### 场景1：表单提交
```typescript
const form = new Container({
  children: [
    new Input({ id: 'username', placeholder: 'Username' }),
    new Input({ id: 'password', type: 'password', placeholder: 'Password' }),
    new Button({
      id: 'submit',
      text: 'Login',
      onClick: () => {
        const username = (BaseComponent.getComponentById('username') as Input)?.getValue();
        const password = (BaseComponent.getComponentById('password') as Input)?.getValue();
        // 提交...
      }
    })
  ]
});
```

### 场景2：动态更新
```typescript
const display = new Label({ id: 'counter', text: 'Count: 0' });
const incrementBtn = new Button({
  id: 'increment',
  text: '+',
  onClick: () => {
    const label = BaseComponent.getComponentById('counter') as Label;
    // 更新显示...
  }
});
```

### 场景3：组件关联
```typescript
const showPasswordBtn = new Button({
  id: 'show-pwd',
  text: 'Show',
  onClick: () => {
    const pwdInput = BaseComponent.getComponentById('password') as Input;
    // 切换输入类型...
  }
});
```

### 场景4：批量操作
```typescript
const components = BaseComponent.getAllComponents();
components.forEach(comp => {
  if (comp instanceof Button) {
    comp.setDisabled(true);
  }
});
```

## ID最佳实践

| 场景 | 建议 | 例子 |
|------|------|------|
| 需要查询和操作的组件 | 自定义ID | `id: 'submit-btn'` |
| 一次性临时组件 | 自动生成ID | 不指定id参数 |
| 容器中的子组件 | 如有引用需求则自定义 | `id: 'name-field'` |
| 列表/循环生成 | 使用唯一标识+索引 | `id: 'item-${id}'` |

## 注意事项

⚠️ **ID重复**：相同ID会导致后注册的组件覆盖先前的
```typescript
// ❌ 不推荐
const btn1 = new Button({ id: 'btn', text: 'Button 1' }).mount(container);
const btn2 = new Button({ id: 'btn', text: 'Button 2' }).mount(container);
// 只能通过ID查询到btn2

// ✅ 推荐
const btn1 = new Button({ id: 'btn-1', text: 'Button 1' }).mount(container);
const btn2 = new Button({ id: 'btn-2', text: 'Button 2' }).mount(container);
```

⚠️ **挂载状态**：只有已挂载的组件才会被注册
```typescript
const button = new Button();
BaseComponent.getComponentById(button.getId()); // 返回undefined

button.mount(container);
BaseComponent.getComponentById(button.getId()); // 返回button实例
```

⚠️ **卸载清理**：卸载时自动从注册表移除
```typescript
button.unmount(); // 自动清理
button.destroy(); // 也会自动清理
```

## 完整示例

```typescript
import { Button, Input, Container, Label, BaseComponent } from 'portableui';

// 创建表单
const form = new Container({
  direction: 'vertical',
  gap: 10,
  children: [
    new Label({ text: 'User Registration' }),
    new Input({
      id: 'name-field',
      placeholder: 'Full Name',
      required: true
    }),
    new Input({
      id: 'email-field',
      type: 'email',
      placeholder: 'Email',
      required: true
    }),
    new Button({
      text: 'Register',
      onClick: () => {
        const name = (BaseComponent.getComponentById('name-field') as Input)?.getValue();
        const email = (BaseComponent.getComponentById('email-field') as Input)?.getValue();
        
        if (name && email) {
          console.log('Registering:', { name, email });
          // 提交表单...
        }
      }
    })
  ]
});

form.mount(document.getElementById('app')!);

// 后续查询和操作
const nameInput = BaseComponent.getComponentById('name-field') as Input;
nameInput?.setValue('John Doe');

const emailInput = BaseComponent.getComponentById('email-field');
emailInput?.focus();
```

