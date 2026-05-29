# 布局系统快速参考

## 导入

```typescript
import { Container, Flex, Grid, Group } from 'portable-ui';
```

## 基础示例

### 1. 水平排列

```typescript
const row = new Container({
  direction: 'horizontal',
  gap: 10,
  children: [btn1, btn2, btn3],
});
row.mount(document.body);
```

### 2. 垂直排列

```typescript
const column = new Container({
  direction: 'vertical',
  gap: 10,
  children: [label, input, button],
});
column.mount(document.body);
```

### 3. 等比分配空间

```typescript
const flex = new Flex({
  direction: 'horizontal',
  gap: 10,
  grow: 1,  // 三个 flex 各占 1/3
  children: [panel1, panel2, panel3],
});
```

### 4. 2:1 比例

```typescript
const layout = new Flex({
  direction: 'horizontal',
  gap: 10,
});

const twoThirds = new Flex({
  grow: 2,
  basis: '0',
  children: [mainContent],
});

const oneThird = new Flex({
  grow: 1,
  basis: '0',
  children: [sidebar],
});

layout.addChild(twoThirds);
layout.addChild(oneThird);
```

### 5. 网格布局

```typescript
const grid = new Grid({
  columns: 3,
  gap: 15,
});

for (let i = 1; i <= 9; i++) {
  const item = Grid.createItem();
  const label = new Label({ text: `Item ${i}` });
  item.addChild(label);
  grid.addChild(item);
}
```

### 6. 跨列网格项

```typescript
const grid = new Grid({ columns: 3, gap: 10 });

// 第一项跨 2 列
const item1 = Grid.createItem({ columnSpan: 2 });
item1.addChild(new Label({ text: 'Wide Item' }));
grid.addChild(item1);

// 其他项纵占 1 列
for (let i = 2; i <= 5; i++) {
  const item = Grid.createItem();
  item.addChild(new Label({ text: `Item ${i}` }));
  grid.addChild(item);
}
```

### 7. 分组表单

```typescript
const form = new Group({
  title: 'User Information',
  direction: 'vertical',
  gap: 12,
  padding: 15,
  borderColor: '#ddd',
  borderRadius: 8,
});

form.addChild(new Label({ text: 'Name:' }));
form.addChild(new Input({ placeholder: 'Enter name' }));
form.addChild(new Label({ text: 'Email:' }));
form.addChild(new Input({ placeholder: 'Enter email' }));
```

### 8. 嵌套分组

```typescript
const main = new Group({ title: 'Settings' });

const section1 = new Group({
  title: 'Profile',
  direction: 'vertical',
  gap: 10,
  padding: 10,
  borderColor: '#eee',
});

section1.addChild(new Input({ placeholder: 'Name' }));
section1.addChild(new Input({ placeholder: 'Email' }));

const section2 = new Group({
  title: 'Security',
  direction: 'vertical',
  gap: 10,
  padding: 10,
  borderColor: '#eee',
});

section2.addChild(new Input({ placeholder: 'Old Password' }));
section2.addChild(new Input({ placeholder: 'New Password' }));

main.addChild(section1);
main.addChild(section2);
```

## 对齐方式

- `'start'` - 从起点对齐
- `'center'` - 居中对齐
- `'end'` - 从末尾对齐
- `'space-between'` - 两端对齐，中间分散
- `'space-around'` - 四周均分

```typescript
// 居中对齐
const centered = new Container({
  direction: 'horizontal',
  justifyContent: 'center',
  alignItems: 'center',
  height: 100,
  children: [button],
});

// 两端对齐
const spread = new Container({
  direction: 'horizontal',
  justifyContent: 'space-between',
  children: [leftBtn, rightBtn],
});
```

## 尺寸设置

```typescript
// 像素
const box = new Container({
  width: 300,
  height: 200,
});

// 字符串
const responsive = new Container({
  width: '100%',
  height: '50vh',
});

// 最小高度
const flexible = new Container({
  minHeight: 100,
  width: '100%',
});
```

## 子元素管理

```typescript
const container = new Container();

// 添加单个子元素
container.addChild(new Button({ text: 'Add' }));

// 获取所有子元素
const children = container.getContainerChildren();

// 移除子元素
const btn = children[0];
container.removeContainerChild(btn);

// 清空所有子元素
container.clearChildren();

// 设置子元素数组
container.setChildren([btn1, btn2, btn3]);
```

## 常见模式

### Header + Content + Footer

```typescript
const app = new Container({
  direction: 'vertical',
  height: '100vh',
  gap: 0,
});

const header = new Container({
  direction: 'horizontal',
  padding: 15,
  backgroundColor: '#333',
  height: 60,
});

const content = new Flex({
  direction: 'vertical',
  grow: 1,
  padding: 20,
});

const footer = new Container({
  direction: 'horizontal',
  padding: 10,
  backgroundColor: '#f5f5f5',
  height: 50,
});

app.addChild(header);
app.addChild(content);
app.addChild(footer);
```

### 两列布局

```typescript
const layout = new Container({
  direction: 'horizontal',
  gap: 15,
  padding: 15,
});

const sidebar = new Container({
  width: 250,
  direction: 'vertical',
});

const main = new Flex({
  grow: 1,
  direction: 'vertical',
});

layout.addChild(sidebar);
layout.addChild(main);
```

### 卡片网格

```typescript
const grid = new Grid({
  columns: 3,
  gap: 15,
  padding: 20,
  width: '100%',
});

for (let i = 1; i <= 6; i++) {
  const card = new Group({
    title: `Card ${i}`,
    direction: 'vertical',
    gap: 10,
    padding: 15,
    backgroundColor: '#fff',
    width: '100%',
  });

  card.addChild(new Label({ text: 'Card content' }));
  card.addChild(new Button({ text: 'Action' }));
  grid.addChild(card);
}
```

### 表单布局

```typescript
const form = new Group({
  title: 'Contact Form',
  direction: 'vertical',
  gap: 15,
  padding: 20,
});

// 两列输入框
const nameRow = new Container({
  direction: 'horizontal',
  gap: 10,
});

const nameField = new Container({
  width: '50%',
  children: [
    new Label({ text: 'First Name' }),
    new Input({}),
  ],
});

const lastNameField = new Container({
  width: '50%',
  children: [
    new Label({ text: 'Last Name' }),
    new Input({}),
  ],
});

nameRow.addChild(nameField);
nameRow.addChild(lastNameField);
form.addChild(nameRow);

// 完整宽度字段
form.addChild(new Label({ text: 'Email' }));
form.addChild(new Input({}));

// 按钮组
const buttons = new Container({
  direction: 'horizontal',
  gap: 10,
  justifyContent: 'flex-end',
});
buttons.addChild(new Button({ text: 'Submit' }));
buttons.addChild(new Button({ text: 'Reset' }));
form.addChild(buttons);
```

## 性能提示

1. **避免频繁重排** - 在容器挂载前添加所有子元素
2. **使用固定尺寸** - 为容器指定明确的宽度/高度
3. **减少嵌套深度** - 保持在 3-4 层以内
4. **复用容器** - 不要频繁创建销毁

## 更多示例

详见 `examples/layout/layout-demo.ts` 和 `docs/LAYOUT_GUIDE.md`

