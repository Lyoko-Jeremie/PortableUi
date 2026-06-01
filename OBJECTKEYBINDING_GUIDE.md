# ObjectKeyBinding 与 Zone.js 脏检测使用指南

## 概述

本文档介绍 PortableUi 命令式接口（`App`）中基于对象 + 点分隔 key 的数据绑定能力，以及通过 Zone.js 和手动 `markDirty` 实现的自动脏检测。

**核心特点：**

- 无全局 `model`：数据绑定到各组件，每个组件控制自己的数据源
- 对象级绑定：通过 `{target, key: 'a.b.c'}` 指定绑定对象和路径
- 自动/手动混用：支持 Zone.js 自动检测 + 显式 `markDirty()` 兜底
- 三层 API：`ctx.touch()` / `app.markDirty()` / `app.markDirtyAll()`

---

## 基础用法

### 1. 简单的对象数据绑定

```typescript
import {App} from 'PortableUi';

const user = {name: 'Alice'};

const app = new App(document.getElementById('app')!);

// 绑定 Input 组件到用户对象的 name 字段
const nameInput = app.addInput({
  id: 'nameInput',
  bind: {
    value: {
      target: user,
      key: 'name',
      detect: 'manual', // 默认需要手动 markDirty
    },
  },
});

// 初始值
console.log(nameInput.getValue()); // 'Alice'

// 修改数据源
user.name = 'Bob';
app.markDirty(user, 'name');

// 异步更新后
setTimeout(() => {
  console.log(nameInput.getValue()); // 'Bob'
}, 0);
```

### 2. Deep 路径绑定

```typescript
const profile = {
  user: {
    contacts: {
      email: 'alice@example.com',
    },
  },
};

const emailLabel = app.addLabel({
  id: 'email',
  text: '邮箱待加载',
  bind: {
    text: {
      target: profile,
      key: 'user.contacts.email', // 支持深层路径
    },
  },
});

profile.user.contacts.email = 'bob@example.com';
app.markDirty(profile, 'user.contacts.email');
```

### 3. 写回与双向绑定

```typescript
const form = {
  username: 'admin',
  password: '',
};

const usernameInput = app.addInput({
  id: 'username',
  bind: {
    value: {
      target: form,
      key: 'username',
    },
  },
});

const passwordInput = app.addInput({
  id: 'password',
  bind: {
    value: {
      target: form,
      key: 'password',
    },
  },
});

// 用户输入时自动写回到数据对象
// usernameInput onInput 事件 -> form.username = 'new_value'
// passwordInput onInput 事件 -> form.password = 'new_value'
```

---

## 脏检测与同步

### API 一览

| API | 说明 | 使用场景 |
|---|---|---|
| `ctx.touch(key?)` | 在回调中标记脏路径，等待 zone 稳定后 flush | 回调内变更多个字段 |
| `app.markDirty(target, key?)` | 显式触发单个对象 + 路径的刷新 | 非回调场景，直接改对象后 |
| `app.markDirtyAll(target)` | 触发整个对象的全部绑定刷新 | 对象多个字段变更 |

### touch() 用法

在组件回调（如 `onClick`）中调用 `ctx.touch()`，让 Zone.js 负责收集脏标记，在任务稳定后统一 flush：

```typescript
const counter = {value: 0};

app.addButton({
  id: 'increment',
  text: 'Increment',
  bind: {
    onClick: (ctx) => {
      counter.value += 1;
      ctx.touch('value'); // 标记数据脏，等待 zone flush
    },
  },
});

const display = app.addLabel({
  id: 'display',
  bind: {
    text: {
      target: counter,
      key: 'value',
    },
  },
});
```

### markDirty() 用法

在 Zone 外（如定时器、外部事件、Promise）修改数据后，显式调用 `markDirty()`：

```typescript
const dataStore = {status: 'idle'};

app.addLabel({
  id: 'status',
  bind: {
    text: {
      target: dataStore,
      key: 'status',
    },
  },
});

// 外部数据源（如 WebSocket、定时器）
setInterval(() => {
  dataStore.status = 'updating...';
  app.markDirty(dataStore, 'status');
}, 1000);
```

### markDirtyAll() 用法

一次性标记整个对象和所有相关绑定为脏：

```typescript
const user = {name: 'Alice', email: 'alice@example.com'};

const nameLabel = app.addLabel({
  id: 'name',
  bind: {
    text: {target: user, key: 'name'},
  },
});

const emailLabel = app.addLabel({
  id: 'email',
  bind: {
    text: {target: user, key: 'email'},
  },
});

// 一次性更新全部
Object.assign(user, {name: 'Bob', email: 'bob@example.com'});
app.markDirtyAll(user);
```

---

## 配置选项

### bindingOptions

在 `App` 初始化时配置脏检测行为：

```typescript
const app = new App(host, {
  bindingOptions: {
    flush: 'microtask', // 'microtask' | 'sync' 何时刷新脏更新
    zoneAutoDirty: true, // 是否启用 zone.js 自动脏检测
    warn: true, // 开发期告警
    strict: false, // 严格模式检查绑定路径
    changeDetection: 'binding', // 全局默认检测模式
  },
});
```

### ObjectKeyBinding 选项

```typescript
bind: {
  value: {
    target: myObject,
    key: 'path.to.field',
    
    // 可选：访问模式
    mode?: 'rw' | 'ro' | 'wo', // 可读可写 / 只读 / 仅写回
    
    // 可选：脏检测方式
    detect?: 'manual' | 'proxy', // 手动 | 自动侦测 set/delete
    
    // 可选：避免无效更新的相等比较
    equals?: (prev, next) => boolean,
    
    // 可选：组件级覆盖 changeDetection
    changeDetection?: 'binding' | 'tree' | 'hybrid',
  },
}
```

---

## 高级场景

### 1. 多组件共享数据源

```typescript
const sharedState = {count: 0};

const inc = app.addButton({
  id: 'inc',
  text: '+1',
  bind: {
    onClick: (ctx) => {
      sharedState.count += 1;
      ctx.touch('count');
    },
  },
});

const dec = app.addButton({
  id: 'dec',
  text: '-1',
  bind: {
    onClick: (ctx) => {
      sharedState.count -= 1;
      ctx.touch('count');
    },
  },
});

const display = app.addLabel({
  id: 'display',
  bind: {
    text: {target: sharedState, key: 'count'},
  },
});
```

### 2. 条件式脏标记

```typescript
const form = {username: '', email: ''};

app.addInput({
  id: 'username',
  bind: {
    value: {target: form, key: 'username'},
    // 自定义相等比较，避免无谓更新
    equals: (prev, next) => prev?.toLowerCase() === next?.toLowerCase(),
  },
});

app.addButton({
  id: 'submit',
  text: 'Submit',
  bind: {
    onClick: (ctx) => {
      if (form.username && form.email) {
        // 只标记验证通过的字段
        ctx.touch('username');
        ctx.touch('email');
      }
    },
  },
});
```

### 3. 只读绑定展示

```typescript
const config = {server: 'api.example.com'};

app.addLabel({
  id: 'serverInfo',
  bind: {
    text: {
      target: config,
      key: 'server',
      mode: 'ro', // 只读，不接收用户输入
    },
  },
});
```

---

## Zone.js 自动检测（zoneAutoDirty）

启用 `zoneAutoDirty: true` 后：

- 每个 Zone 内的异步任务完成后触发一次脏 flush
- 不需要每次都手动 `markDirty()`
- 性能开销：较低，仅在任务结束时触发一次

**何时启用：**

- 事件驱动的 UI（用户交互频繁）
- 回调多、路径复杂的场景
- 倾向"自动同步"编程模型

**何时禁用（默认）：**

- 需要精确控制更新时机
- 性能敏感的应用（Tree 模式会有成本）
- 显式编程风格偏好

---

## 常见问题

### Q: ObjectKeyBinding 和旧的路径字符串绑定 (`'path.to.field'`) 的区别？

**旧模型（路径字符串）：**
- 必须有全局 `model` 对象
- 绑定源：`'form.name'` -> 从全局 model 读写
- 适合："中心化数据 + 多组件"

**新模型（ObjectKeyBinding）：**
- 无全局 model 限制
- 绑定源：`{target: user, key: 'profile.name'}` -> 每组件独立数据源
- 适合："组件级数据 + 轻量化应用"

两者并存，可按需选用。

### Q: ctx.touch() 和 app.markDirty() 的性能差异？

- `ctx.touch()`：在 Zone 内收集路径，待任务稳定后**一次性 flush**（推荐）
- `app.markDirty()`：立即触发对应绑定刷新（同步或微任务）

对于一个回调内改多个字段：
- ❌ 多次 `markDirty()` 会导致多次 flush
- ✅ 多次 `touch()` 仅 flush 一次

### Q: detect: 'proxy' 和 detect: 'manual' 的差异？

| 模式 | 行为 | 开销 |
|---|---|---|
| `manual` | 需要显式 `markDirty()` | 低 |
| `proxy` | 对象写入自动触发 `markDirty()` | 中（Proxy 开销） |

### Q: 多个对象绑定到不同组件时如何管理？

无需管理，每个对象独立构建索引。`markDirty(obj1)` 仅影响 `obj1` 的绑定，不影响其他对象。

---

## 完整示例：Todo 应用

```typescript
import {App} from 'PortableUi';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const todos: Todo[] = [
  {id: 1, title: 'Learn', done: false},
  {id: 2, title: 'Build', done: true},
];

const state = {
  input: '',
  todos: todos,
};

const app = new App(document.getElementById('app')!);

// 输入框
const todoInput = app.addInput({
  id: 'todoInput',
  placeholder: 'Add a todo',
  bind: {
    value: {target: state, key: 'input'},
  },
});

// 添加按钮
app.addButton({
  id: 'addBtn',
  text: 'Add',
  bind: {
    onClick: (ctx) => {
      if (state.input.trim()) {
        state.todos.push({
          id: Date.now(),
          title: state.input,
          done: false,
        });
        state.input = '';
        ctx.touch('input');
        ctx.touch('todos');
      }
    },
  },
});

// 动态渲染 TODO 列表（简化写法）
// 实际应该用 Container + 子组件，这里仅示意
app.addLabel({
  id: 'todos',
  text: `${state.todos.length} todos`,
  bind: {
    text: {target: state, key: 'todos'},
  },
});
```

---

## 总结

ObjectKeyBinding + Zone.js 脏检测提供了一套轻量、灵活的数据绑定方案：

- ✓ 无全局 model 的约束
- ✓ 对象 + 路径的精确控制
- ✓ 三层 API（`touch` / `markDirty` / `markDirtyAll`）满足不同场景
- ✓ 与现有 Signal / Accessor 绑定并存，可逐步迁移

**建议使用姿势：**

1. 小应用或轻量 UI：优先 `ObjectKeyBinding` + `markDirty()`
2. 事件密集场景：启用 `zoneAutoDirty: true` 减少手工
3. 复杂状态：考虑 Signal 或 Accessor 模式作曲
4. 性能关键路径：显式 `touch()` 精确控制 flush

