# 组件ID - 快速参考

## 核心API

### 获取组件ID
```typescript
const id = component.getId();
```

### 查询组件
```typescript
// 在容器作用域通过ID获取组件实例
const component = BaseComponent.queryComponentById(container, 'my-id');

// 在容器作用域通过ID获取DOM元素
const element = BaseComponent.queryElementById(container, 'my-id');

// 在当前组件根元素中查找后代组件
const child = parentComponent.findComponentById('child-id');

// 查询当前组件的子组件（默认 deep = true）
const descendants = parentComponent.findChildComponents();

// 只查直接子组件
const directChildren = parentComponent.findChildComponents(false);

// 查询当前组件最近父组件
const parent = childComponent.findParentComponent();

// 从任意DOM节点向上查询最近父组件
const owner = BaseComponent.queryParentComponent(domNode);
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
        const username = BaseComponent.queryComponentById<Input>(document.body, 'username')?.getValue();
        const password = BaseComponent.queryComponentById<Input>(document.body, 'password')?.getValue();
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
    const label = BaseComponent.queryComponentById<Label>(document.body, 'counter');
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
    const pwdInput = BaseComponent.queryComponentById<Input>(document.body, 'password');
    // 切换输入类型...
  }
});
```

### 场景4：按容器批量操作
```typescript
container.querySelectorAll('[id]').forEach((el) => {
  const comp = BaseComponent.queryComponentById(container, el.id);
  if (comp instanceof Button) {
    comp.setDisabled(true);
  }
});
```

### 场景5：父子组件联动
```typescript
const group = new Container({ id: 'group' });
group.mount(document.body);

const saveBtn = new Button({ id: 'save-btn', text: 'Save' });
saveBtn.mount(group.getElement()!);

// 子组件查父组件
const parent = saveBtn.findParentComponent<Container>();

// 父组件查子组件
const children = group.findChildComponents<Button>(false);
```

## ID最佳实践

| 场景 | 建议 | 例子 |
|------|------|------|
| 需要查询和操作的组件 | 自定义ID | `id: 'submit-btn'` |
| 一次性临时组件 | 自动生成ID | 不指定id参数 |
| 容器中的子组件 | 如有引用需求则自定义 | `id: 'name-field'` |
| 列表/循环生成 | 使用唯一标识+索引 | `id: 'item-${id}'` |

## 注意事项

⚠️ **ID重复**：相同容器内重复ID会导致查询结果不确定
```typescript
// ❌ 不推荐
const btn1 = new Button({ id: 'btn', text: 'Button 1' }).mount(container);
const btn2 = new Button({ id: 'btn', text: 'Button 2' }).mount(container);
// 结果可能命中其中一个，不应依赖顺序

// ✅ 推荐
const btn1 = new Button({ id: 'btn-1', text: 'Button 1' }).mount(container);
const btn2 = new Button({ id: 'btn-2', text: 'Button 2' }).mount(container);
```

⚠️ **挂载状态**：只有已挂载在该容器内的组件才能被查询
```typescript
const button = new Button();
BaseComponent.queryComponentById(container, button.getId()); // 返回null

button.mount(container);
BaseComponent.queryComponentById(container, button.getId()); // 返回button实例
```

⚠️ **卸载清理**：卸载后组件会离开容器作用域
```typescript
button.unmount();
BaseComponent.queryComponentById(container, button.getId()); // 返回null
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
        const name = BaseComponent.queryComponentById<Input>(document.body, 'name-field')?.getValue();
        const email = BaseComponent.queryComponentById<Input>(document.body, 'email-field')?.getValue();
        
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
const nameInput = BaseComponent.queryComponentById<Input>(document.body, 'name-field');
nameInput?.setValue('John Doe');

const emailInput = BaseComponent.queryComponentById<Input>(document.body, 'email-field');
emailInput?.focus();
```

