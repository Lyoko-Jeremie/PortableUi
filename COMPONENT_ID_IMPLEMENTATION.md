# 组件ID功能实现说明

## 概述

版本更新：为所有PortableUi组件添加了ID参数和查询功能。

## 功能特性

### 1. 自动ID生成
- 当没有明确指定ID时，系统自动为每个组件生成唯一ID
- 自动生成的ID格式：`{ComponentName}_{randomString}`
- 示例：`Button_a1b2c3d4e`, `Input_f5g6h7i8j`

### 2. 自定义ID
- 用户可以为组件指定自定义ID
- 自定义ID会覆盖自动生成的ID

### 3. 组件查询API
- `component.getId()` - 获取组件的ID
- `BaseComponent.getComponentById(id)` - 通过ID获取组件实例
- `BaseComponent.getElementById(id)` - 通过ID获取DOM元素
- `BaseComponent.getAllComponents()` - 获取所有已注册的组件
- `BaseComponent.clearRegistry()` - 清空组件注册表

## 实现细节

### 修改的文件

#### 1. `src/core/BaseComponent.ts`
- 添加了 `private static componentRegistry` 静态属性来存储已挂载的组件
- 添加了 `initializeComponentId()` 私有方法自动生成ID（如果未提供）
- 添加了 `getId()` 公共方法来获取组件ID
- 在 `mount()` 方法中注册组件到全局注册表
- 在 `unmount()` 方法中从注册表中移除组件
- 在 `destroy()` 方法中清理注册表
- 添加了四个静态查询方法：
  - `registerComponent()` - 私有，用于注册组件
  - `unregisterComponent()` - 私有，用于移除组件
  - `getComponentById()` - 公开，通过ID查询组件
  - `getElementById()` - 公开，通过ID查询DOM元素
  - `getAllComponents()` - 公开，获取所有组件
  - `clearRegistry()` - 公开，清空注册表

### 自动生成ID的工作流程

1. 组件被创建时（构造函数中）：
   ```typescript
   constructor(props, lifecycle) {
     this.props = props;
     this.lifecycle = lifecycle;
     this.initializeComponentId(); // 初始化ID
   }
   ```

2. `initializeComponentId()` 方法检查：
   - 如果 `props.id` 存在，不做任何操作
   - 如果 `props.id` 不存在，使用组件类名和随机字符串生成ID

3. 组件挂载时（`mount()` 方法中）：
   - 调用 `BaseComponent.registerComponent(this)` 将组件注册到全局注册表

4. 组件卸载时（`unmount()` 或 `destroy()` 方法中）：
   - 调用 `BaseComponent.unregisterComponent(this)` 从注册表中移除组件

## 使用示例

### 基础用法
```typescript
// 自动生成ID
const button = new Button({ text: 'Click' });
console.log(button.getId()); // Button_a1b2c3d4e

// 自定义ID
const customButton = new Button({ 
  id: 'submit-btn',
  text: 'Submit' 
});
console.log(customButton.getId()); // submit-btn
```

### 查询组件
```typescript
const button = new Button({ id: 'my-btn', text: 'Click' });
button.mount(container);

// 通过ID获取组件实例
const found = BaseComponent.getComponentById('my-btn');
if (found instanceof Button) {
  found.setText('Updated');
}

// 通过ID获取DOM元素
const dom = BaseComponent.getElementById('my-btn');
dom?.style.backgroundColor = 'blue';
```

### 在容器中使用
```typescript
const form = new Container({
  children: [
    new Input({ id: 'name', placeholder: 'Name' }),
    new Input({ id: 'email', type: 'email', placeholder: 'Email' }),
    new Button({
      id: 'submit',
      text: 'Submit',
      onClick: () => {
        const name = BaseComponent.getComponentById('name') as Input;
        const email = BaseComponent.getComponentById('email') as Input;
        console.log({ name: name.getValue(), email: email.getValue() });
      }
    })
  ]
});

form.mount(document.body);
```

## 测试覆盖

新增的测试文件：`test/components/basic/ComponentID.test.ts`

测试用例包括：
- ✅ 自动ID生成
- ✅ 自定义ID使用
- ✅ 挂载时的组件注册
- ✅ 卸载时的组件移除
- ✅ 销毁时的组件移除
- ✅ 通过ID查询DOM元素
- ✅ 非存在ID的查询
- ✅ 多个组件的追踪
- ✅ ID更新场景
- ✅ 容器组件中的ID使用
- ✅ 不同类型组件的唯一ID
- ✅ 注册表清空

所有13个测试都通过。

## 向后兼容性

此实现完全向后兼容：
- 现有的组件代码无需修改
- ComponentProps 接口中的 `id?` 属性已经存在
- applyCommonElementProps 已经处理了ID属性设置

## 性能考虑

- 使用 `Map` 数据结构确保O(1)的查询性能
- 注册/卸载操作都是O(1)的
- 不会给组件本身增加显著的内存开销

## 最佳实践

1. **为关键组件指定语义化ID**
   ```typescript
   new Button({ id: 'submit-button', text: 'Submit' })
   ```

2. **避免ID冲突**
   - 如果使用相同的ID挂载多个组件，后面的会覆盖前面的
   - 确保ID在应用范围内是唯一的

3. **及时清理**
   ```typescript
   component.unmount();  // 自动清理
   // 或
   component.destroy();  // 完全销毁
   ```

4. **使用ID实现组件间通信**
   ```typescript
   onClick: () => {
     const relatedComponent = BaseComponent.getComponentById('other-id');
     // 与其他组件交互
   }
   ```

## 文档和示例

- 详细指南：`COMPONENT_ID_GUIDE.md`
- 实际示例：`examples/basic/component-id-examples.ts`

## 相关文件

- `src/core/BaseComponent.ts` - 核心实现
- `src/types/components.ts` - ComponentProps (已包含id属性)
- `src/components/basic/internal.ts` - applyCommonElementProps (已处理id)
- `test/components/basic/ComponentID.test.ts` - 测试用例

