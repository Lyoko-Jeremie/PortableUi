# Component ID 功能说明

## 新增功能概览

从本版本开始，PortableUi的所有组件都支持通过ID进行查询操作。这使得您可以：

- 🔍 **精确定位组件** - 通过ID快速查找特定组件
- 📌 **标记重要组件** - 为需要交互的组件指定语义化ID
- 🔄 **组件间通信** - 轻松实现组件之间的联动
- ⚡ **快速操作** - 基于容器作用域的直接查询

## 核心特性

### 1️⃣ 自动ID生成
```typescript
const button = new Button({ text: 'Click' });
console.log(button.getId()); // Button_a1b2c3d4e
```

### 2️⃣ 自定义ID
```typescript
const button = new Button({ 
  id: 'submit-btn',
  text: 'Submit' 
});
```

### 3️⃣ 组件查询
```typescript
// 在容器作用域获取组件实例
const component = BaseComponent.queryComponentById(container, 'my-id');

// 在容器作用域获取DOM元素
const element = BaseComponent.queryElementById(container, 'my-id');

// 在组件实例自身作用域查询
const child = componentA.findComponentById('child-id');
```

## 快速开始

### 最简单的用法
```typescript
import { Button, Input, Container, BaseComponent } from 'portableui';

const root = document.body;

// 创建表单
const form = new Container({
  children: [
    new Input({ id: 'name', placeholder: 'Name' }),
    new Input({ id: 'email', type: 'email', placeholder: 'Email' }),
    new Button({
      text: 'Submit',
      onClick: () => {
        // 通过ID获取输入框
        const nameInput = BaseComponent.queryComponentById<Input>(root, 'name');
        const emailInput = BaseComponent.queryComponentById<Input>(root, 'email');
        
        console.log({
          name: nameInput?.getValue(),
          email: emailInput?.getValue()
        });
      }
    })
  ]
});

// 挂载到页面
form.mount(root);
```

### 后续修改组件
```typescript
// 获取并修改现有组件
const nameInput = BaseComponent.queryComponentById<Input>(root, 'name');
nameInput?.setValue('John Doe');
nameInput?.focus();
```

## API 参考

### 组件实例方法
| 方法 | 说明 | 返回值 |
|------|------|--------|
| `getId()` | 获取组件ID | `string` |

### BaseComponent 静态方法
| 方法 | 说明 | 返回值 |
|------|------|--------|
| `queryComponentById(container, id)` | 在容器作用域通过ID获取组件 | `BaseComponent \| null` |
| `queryElementById(container, id)` | 在容器作用域通过ID获取DOM元素 | `HTMLElement \| null` |

## 使用场景

### 场景1：表单验证
```typescript
new Button({
  text: 'Submit',
  onClick: () => {
    const nameField = BaseComponent.queryComponentById<Input>(root, 'name');
    if (!nameField?.getValue()) {
      alert('Please enter a name');
      return;
    }
    // 提交表单...
  }
})
```

### 场景2：动态更新
```typescript
new Button({
  id: 'increment',
  text: '+',
  onClick: () => {
    const counter = BaseComponent.queryComponentById<Label>(root, 'counter');
    let count = parseInt(counter?.getText() ?? '0') + 1;
    counter?.setText(`Count: ${count}`);
  }
})
```

### 场景3：条件显示/隐藏
```typescript
new Button({
  text: 'Toggle',
  onClick: () => {
    const preview = BaseComponent.queryElementById(root, 'preview');
    if (preview) {
      preview.style.display = 
        preview.style.display === 'none' ? 'block' : 'none';
    }
  }
})
```

## 最佳实践

✅ **推荐做法**
```typescript
// 为需要查询的组件指定ID
const form = new Container({
  children: [
    new Input({ id: 'email-field', type: 'email' }),
    new Button({ id: 'submit-btn', text: 'Submit' })
  ]
});
```

❌ **避免做法**
```typescript
// 不要使用重复的ID
const btn1 = new Button({ id: 'btn', text: 'Button 1' });
const btn2 = new Button({ id: 'btn', text: 'Button 2' });
// 查询结果只在当前容器内生效，且重复ID会带来歧义
```

## 完整文档

更详细的使用指南，请查阅以下文档：

- 📖 [快速开始指南](./COMPONENT_ID_QUICK_START.md) - API速查和常见场景
- 📚 [完整使用指南](./COMPONENT_ID_GUIDE.md) - 详细功能说明
- 🔧 [实现细节](./COMPONENT_ID_IMPLEMENTATION.md) - 技术实现说明
- 💡 [示例代码](./examples/basic/component-id-examples.ts) - 8个实际代码示例

## 常见问题

### Q: 如果不指定ID会怎样？
A: 系统会自动为您生成一个ID，格式为 `{ComponentName}_{randomString}`。

### Q: 自动生成的ID会改变吗？
A: 不会。ID在组件创建时分配，之后保持不变。

### Q: 可以修改组件的ID吗？
A: 可以通过 `update({id: 'new-id'})` 修改。组件重渲染后，新的ID可在相同容器作用域内被查询到。

### Q: 已卸载的组件还能查询到吗？
A: 不能。卸载后元素已脱离容器作用域，查询会返回 `null`。

### Q: 这会影响性能吗？
A: 查询基于容器范围执行，通常开销可控。建议限制查询范围到最近父容器。

## 兼容性

✅ **完全向后兼容** - 现有代码无需修改，所有组件自动获得ID功能。

---

有任何问题或反馈？请参考相关文档或提交issue。

