# 布局系统指南

## 概述

PortableUi 的布局系统提供了四个核心容器组件来灵活组织和排列 UI 元素：

- **Container** - 基础容器，提供弹性盒子（Flexbox）布局
- **Flex** - 弹性布局容器，扩展了 Container，支持伸缩系数
- **Grid** - 网格布局容器，基于 CSS Grid 的强大二维布局
- **Group** - 分组容器，用于组织相关元素并提供标题和边框

## 快速开始

### 安装

```typescript
import { Container, Flex, Grid, Group } from 'portable-ui';
```

### 基础示例

```typescript
// 创建一个水平容器
const container = new Container({
  direction: 'horizontal',
  gap: 10,
  padding: 15,
});

// 添加子元素
const button = new Button({ text: 'Click me' });
container.addChild(button);

// 挂载到 DOM
container.mount(document.body);
```

## Container (基础容器)

### 功能

Container 是所有容器的基础，提供弹性盒子布局功能。

### Props

```typescript
interface ContainerProps extends ComponentProps {
  // 布局方向：'horizontal' (默认) | 'vertical'
  direction?: 'horizontal' | 'vertical';

  // 主轴对齐方式
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';

  // 交叉轴对齐方式
  alignItems?: 'start' | 'center' | 'end' | 'stretch';

  // 间距（像素或字符串）
  gap?: string | number;

  // 填充（像素或字符串）
  padding?: string | number;

  // 背景颜色
  backgroundColor?: string;

  // 宽度
  width?: string | number;

  // 高度
  height?: string | number;

  // 最小高度
  minHeight?: string | number;

  // 是否换行
  wrap?: boolean;

  // 子元素数组
  children?: (BaseComponent | HTMLElement)[];
}
```

### 方法

```typescript
// 添加子元素
container.addChild(childComponent);

// 移除子元素
container.removeContainerChild(childComponent);

// 清空所有子元素
container.clearChildren();

// 获取所有子元素
const children = container.getContainerChildren();

// 设置子元素数组
container.setChildren([child1, child2]);
```

### 示例

#### 水平布局

```typescript
const hContainer = new Container({
  direction: 'horizontal',
  gap: 15,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
});

hContainer.addChild(new Button({ text: 'Button 1' }));
hContainer.addChild(new Button({ text: 'Button 2' }));
hContainer.addChild(new Button({ text: 'Button 3' }));

hContainer.mount(document.body);
```

#### 垂直布局

```typescript
const vContainer = new Container({
  direction: 'vertical',
  gap: 10,
  padding: 15,
  backgroundColor: '#f5f5f5',
});

vContainer.addChild(new Label({ text: 'Name:' }));
vContainer.addChild(new Input({ placeholder: 'Enter name' }));
vContainer.addChild(new Label({ text: 'Email:' }));
vContainer.addChild(new Input({ placeholder: 'Enter email' }));

vContainer.mount(document.body);
```

#### 对齐选项

```typescript
// 空间均分
const spread = new Container({
  direction: 'horizontal',
  justifyContent: 'space-between',
  width: 300,
});

// 居中对齐
const center = new Container({
  direction: 'horizontal',
  justifyContent: 'center',
  alignItems: 'center',
});

// 两端对齐，中间均匀分布
const around = new Container({
  direction: 'horizontal',
  justifyContent: 'space-around',
});
```

## Flex (弹性布局)

### 功能

Flex 扩展了 Container，添加了 Flexbox 伸缩系数支持，用于创建响应式的伸缩布局。

### Props

```typescript
interface FlexProps extends ContainerProps {
  // 伸展系数（占据可用空间的比例）
  grow?: number;

  // 收缩系数（空间不足时的缩小比例）
  shrink?: number;

  // 基础尺寸
  basis?: string | number;

  // 是否为内联 flex
  inline?: boolean;
}
```

### 使用场景

Flex 适用于需要动态分配空间的布局，例如：
- 响应式侧边栏
- 弹性的表单布局
- 等比例分割的栏目

### 示例

#### 基础伸缩布局

```typescript
const parent = new Flex({
  direction: 'horizontal',
  gap: 10,
});

// 三个子 flex，占比为 1:2:1
const flex1 = new Flex({
  grow: 1,
  basis: '0',
  backgroundColor: '#ff9999',
  padding: 10,
});

const flex2 = new Flex({
  grow: 2,  // 占据 2 倍空间
  basis: '0',
  backgroundColor: '#99ff99',
  padding: 10,
});

const flex3 = new Flex({
  grow: 1,
  basis: '0',
  backgroundColor: '#9999ff',
  padding: 10,
});

parent.addChild(flex1);
parent.addChild(flex2);
parent.addChild(flex3);
parent.mount(document.body);
```

#### 固定宽度与伸缩

```typescript
const layout = new Flex({
  direction: 'horizontal',
  gap: 10,
});

// 固定宽度侧边栏
const sidebar = new Flex({
  grow: 0,
  basis: '250px',
  padding: 15,
});

// 伸缩主内容区
const content = new Flex({
  grow: 1,
  basis: '0',
  padding: 15,
});

layout.addChild(sidebar);
layout.addChild(content);
```

## Grid (网格布局)

### 功能

Grid 提供基于 CSS Grid 的二维网格布局，适合创建表格、卡片墙等规则布局。

### Props

```typescript
interface GridProps extends ContainerProps {
  // 列数
  columns?: number;

  // 行数
  rows?: number;

  // 列间距
  columnGap?: string | number;

  // 行间距
  rowGap?: string | number;

  // 自动行高
  autoRows?: string | number;

  // 自动列宽
  autoColumns?: string | number;
}
```

### GridItem Props

```typescript
interface GridItemProps extends ComponentProps {
  // 列跨度
  columnSpan?: number;

  // 行跨度
  rowSpan?: number;
}
```

### 方法

```typescript
// 创建网格项目
const item = Grid.createItem({
  columnSpan: 2,
  rowSpan: 1,
});
```

### 示例

#### 基础网格

```typescript
const grid = new Grid({
  columns: 3,
  gap: 15,
  padding: 20,
});

// 添加 9 个项目
for (let i = 1; i <= 9; i++) {
  const item = Grid.createItem();
  const label = new Label({ text: `Item ${i}` });
  item.addChild(label);
  grid.addChild(item);
}

grid.mount(document.body);
```

#### 不规则高度

```typescript
const grid = new Grid({
  columns: 3,
  autoRows: '100px',  // 所有行高 100px
  gap: 10,
});

// 第一项跨 2 列和 2 行
const item1 = Grid.createItem({
  columnSpan: 2,
  rowSpan: 2,
});

grid.addChild(item1);

// 其他项目自动排列
for (let i = 2; i <= 6; i++) {
  const item = Grid.createItem();
  grid.addChild(item);
}

grid.mount(document.body);
```

#### 响应式网格

```typescript
const grid = new Grid({
  columns: 4,
  gap: 15,
  padding: 20,
  width: '100%',
});

// 宽屏下 4 列，中等屏 3 列，小屏 2 列
// 需要配合媒体查询处理
```

## Group (分组容器)

### 功能

Group 提供带标题、边框和分组样式的容器，用于组织相关的表单字段或功能区。

### Props

```typescript
interface GroupProps extends ContainerProps {
  // 分组标题
  title?: string;

  // 标题位置：'top' (默认) | 'left'
  titlePosition?: 'top' | 'left';

  // 是否显示边框（默认 true）
  bordered?: boolean;

  // 边框颜色
  borderColor?: string;

  // 边框宽度
  borderWidth?: string | number;

  // 边框样式：'solid' | 'dashed' | 'dotted'
  borderStyle?: 'solid' | 'dashed' | 'dotted';

  // 圆角大小
  borderRadius?: string | number;

  // 背景色
  backgroundColor?: string;
}
```

### 示例

#### 基础分组

```typescript
const group = new Group({
  title: 'Login Form',
  direction: 'vertical',
  gap: 12,
  padding: 20,
  borderColor: '#ddd',
  borderRadius: 8,
  backgroundColor: '#fff',
});

group.addChild(new Label({ text: 'Username:' }));
group.addChild(new Input({ placeholder: 'Enter username' }));

group.addChild(new Label({ text: 'Password:' }));
group.addChild(new Input({ placeholder: 'Enter password', style: { type: 'password' } }));

group.mount(document.body);
```

#### 嵌套分组

```typescript
const mainGroup = new Group({
  title: 'User Settings',
  direction: 'vertical',
  gap: 15,
  padding: 20,
});

// 个人信息子组
const personalGroup = new Group({
  title: 'Personal Information',
  direction: 'vertical',
  gap: 10,
  padding: 15,
  borderColor: '#eee',
});

personalGroup.addChild(new Input({ placeholder: 'Full Name' }));
personalGroup.addChild(new Input({ placeholder: 'Email' }));

// 密码子组
const securityGroup = new Group({
  title: 'Security',
  direction: 'vertical',
  gap: 10,
  padding: 15,
  borderColor: '#eee',
});

securityGroup.addChild(new Input({ placeholder: 'Current Password' }));
securityGroup.addChild(new Input({ placeholder: 'New Password' }));

mainGroup.addChild(personalGroup);
mainGroup.addChild(securityGroup);
mainGroup.mount(document.body);
```

#### 标题在左侧

```typescript
const group = new Group({
  title: 'Settings',
  titlePosition: 'left',
  direction: 'horizontal',
  gap: 20,
  padding: 15,
});

// 标题会显示在左侧，内容在右侧
```

#### 无边框分组

```typescript
const group = new Group({
  title: 'Actions',
  bordered: false,
  direction: 'horizontal',
  gap: 10,
  padding: 10,
});

group.addChild(new Button({ text: 'Save' }));
group.addChild(new Button({ text: 'Cancel' }));
group.mount(document.body);
```

## 高级用法

### 复杂嵌套布局

```typescript
const app = new Container({
  direction: 'vertical',
  gap: 15,
  padding: 20,
});

// 头部
const header = new Flex({
  direction: 'horizontal',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  padding: 15,
  backgroundColor: '#333',
});
app.addChild(header);

// 主要内容区 - Grid 布局
const mainContent = new Grid({
  columns: 2,
  gap: 15,
  padding: 15,
});

// 左侧栏 - 导航
const sidebar = new Group({
  title: 'Navigation',
  direction: 'vertical',
  gap: 10,
  padding: 15,
});

// 右侧栏 - 详情
const details = new Group({
  title: 'Details',
  direction: 'vertical',
  gap: 10,
  padding: 15,
});

mainContent.addChild(sidebar);
mainContent.addChild(details);
app.addChild(mainContent);

// 底部
const footer = new Container({
  direction: 'horizontal',
  justifyContent: 'center',
  gap: 10,
  padding: 15,
  backgroundColor: '#f5f5f5',
});
app.addChild(footer);

app.mount(document.body);
```

### 动态尺寸

```typescript
// 根据容器宽度变化选择不同的列数
function createResponsiveGrid() {
  const width = window.innerWidth;
  const columns = width > 1200 ? 4 : width > 768 ? 3 : 2;

  return new Grid({
    columns: columns,
    gap: 15,
    padding: 20,
    width: '100%',
  });
}

// 处理窗口 resize 事件
window.addEventListener('resize', () => {
  // 重新创建或更新布局
});
```

### 样式集成

```typescript
const styledContainer = new Container({
  direction: 'vertical',
  gap: 10,
  padding: 15,
  backgroundColor: '#f5f5f5',
  borderRadius: 8,
  style: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
  },
});
```

## 性能建议

1. **避免过深的嵌套** - 保持 3-4 层以内的嵌套深度
2. **复用容器** - 使用状态管理而不是频繁创建销毁容器
3. **脏值检测** - 只在必要时更新布局
4. **固定尺寸** - 为容器指定固定高度以避免重排
5. **使用 Grid 处理表格** - 避免在 Container 中创建复杂的行/列结构

## 最佳实践

1. **命名明确** - 给容器设置有意义的 id
2. **语义化** - 使用 Group 来组织相关元素
3. **一致的间距** - 使用统一的 gap 和 padding 值
4. **对齐一致** - 在相同上下文中使用相同的 justifyContent/alignItems
5. **颜色一致** - 使用主题颜色变量，保持整体风格
6. **文档化** - 为复杂布局添加注释说明结构

## 常见问题

### Q: 如何实现响应式布局？
A: 使用 `wrap: true` 和灵活的宽度设置，或使用 Flex 的 grow/shrink 属性。

### Q: Container 和 Flex 有什么区别？
A: Container 是基础容器，Flex 扩展了它并支持伸缩系数（grow/shrink）。

### Q: 如何实现水平滚动？
A: 在 Container 上设置 `overflow: 'auto'` 样式，并设置固定宽度。

### Q: Grid 支持自适应列数吗？
A: Grid 需要指定列数。对于自适应，建议使用 Container + wrap。

### Q: 如何在容器间共享样式？
A: 使用样式继承或创建样式工厂函数。

## 参考

- [MDN Flexbox](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Flexbox)
- [MDN CSS Grid](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Grids)
- [BaseComponent API](../DOM_ACCESS_GUIDE.md)

