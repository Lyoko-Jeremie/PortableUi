# 容器嵌套支持 - 实现总结

## 功能概览

所有容器类型现在都支持通过命令式 `add*()` 快捷方法直接添加子组件和嵌套容器，包括：
- `addButton()`、`addInput()` 等基础组件
- `addContainer()`、`addFlex()`、`addGrid()`、`addGroup()`、`addGridItem()` 等容器组件

## 实现要点

### 1. 核心注册表系统
**文件**: `src/components/container/imperative.ts`

- `builtInContainerChildRegistry`: 包含基础和复杂组件
- `ContainerComponentCtors`: 容器组件的类型定义（避免循环依赖）
- `BuiltInContainerWithNestedRegistry`: 合并后的完整注册表类型
- `installGeneratedAddMethods()`: 统一的方法生成函数

### 2. Container 基类集成
**文件**: `src/components/container/Container.ts`

```typescript
constructor(props: ContainerProps = {}) {
  super(props);
  this.children = props.children || [];
  this.installGeneratedAddMethods();
}

private getFullRegistry(): BuiltInContainerWithNestedRegistry {
  // 延迟导入以避免循环依赖
  const {Flex, Grid, GridItem, Group} = require('./index');
  return {
    ...builtInContainerChildRegistry,
    Container: Container,
    Flex,
    Grid,
    GridItem,
    Group,
  } as BuiltInContainerWithNestedRegistry;
}
```

关键特点：
- 延迟导入容器组件避免循环依赖
- 通过接口合并 `extends BuiltInContainerWithNestedAddMethods` 提供类型提示
- 所有继承 `Container` 的类（`Flex`、`Grid`、`Group`）自动继承命令式 API

### 3. GridItem 特殊处理
**文件**: `src/components/container/Grid.ts`

`GridItem` 虽然不继承 `Container`，但实现相同的 `add*` API：
- 有独立的 `children` 管理
- 有 `addChild()` 方法
- 实现相同的 `getFullRegistry()` 和 `installGeneratedAddMethods()`
- 通过接口合并同样提供类型提示

## 使用示例

### 基础用法
```typescript
const flex = new Flex({direction: 'vertical'});
flex.mount(host);

// 直接添加按钮
const btn = flex.addButton({id: 'btn1', text: 'Click me'});

// 直接添加输入框
const input = flex.addInput({id: 'input1', placeholder: 'Type here'});
```

### 容器嵌套
```typescript
const outer = new Container({id: 'outer'});
outer.mount(host);

// 添加嵌套容器
const inner = outer.addContainer({id: 'inner'}) as Container;

// 向嵌套容器中添加组件
const btn = inner.addButton({id: 'nested-btn', text: 'In nested'});

// 多层嵌套
const grid = inner.addGrid({id: 'nested-grid', columns: 2});
const flex = grid.addFlex({id: 'flex-in-grid', direction: 'vertical'});
const label = flex.addLabel({id: 'label', text: 'Deep nesting!'});
```

### 与其他容器组合
```typescript
const group = new Group({title: 'Settings'});
group.mount(host);

// Group 也支持所有 add* 方法
const flex = group.addFlex({direction: 'horizontal'});
const checkbox = flex.addCheckbox({id: 'dark-mode', text: 'Dark mode'});

// 添加其他容器类型
const grid = group.addGrid({columns: 2});
```

## 支持的一览表

### 所有容器类型支持以下快捷方法

**基础组件**:
- `addButton()`, `addInput()`, `addLabel()`, `addTextBox()`
- `addSelect()`, `addCheckbox()`, `addRadio()`, `addSlider()`
- `addDatePicker()`, `addFileUpload()`, `addImage()`, `addCanvas()`

**复杂组件**:
- `addTable()`, `addTreeView()`, `addTabs()`, `addModal()`
- `addToast()`, `addProgress()`, `addAutocomplete()`, `addCascadingSelect()`

**容器组件**:
- `addContainer()`, `addFlex()`, `addGrid()`, `addGridItem()`, `addGroup()`

## 测试覆盖

新增测试用例（77 个测试全通过）：
- ✅ Container 容器嵌套和快捷方法
- ✅ Flex 容器嵌套和快捷方法  
- ✅ Grid 容器嵌套和快捷方法
- ✅ GridItem 快捷方法
- ✅ Group 容器嵌套和快捷方法

每个容器都验证：
- 支持基础组件 `add*` 方法
- 支持容器嵌套 `add*` 方法
- 方法返回正确的实例类型
- 子组件正确添加到容器
- DOM 树结构正确

## 技术细节

### 循环依赖处理
通过延迟导入（动态 `require`）在运行时解决：
```typescript
private getFullRegistry(): BuiltInContainerWithNestedRegistry {
  const {Flex, Grid, GridItem, Group} = require('./index');
  // ...
}
```

### 类型推断
使用接口合并让 IDE 提供完整的类型提示：
```typescript
export interface Container extends BuiltInContainerWithNestedAddMethods {}
```

### 方法生成
`installGeneratedAddMethods` 使用 `Object.defineProperty` 动态生成所有 `add*` 方法，保持代码 DRY。

## 向后兼容性

✅ 完全向后兼容！
- 现有的 `addChild()` 方法仍然工作
- 现有的构造函数 `children` 参数仍然支持
- 现有的 API（如 `getContainerChildren()` 等）保持不变
- 只是添加了新的便捷方法，没有修改现有功能

