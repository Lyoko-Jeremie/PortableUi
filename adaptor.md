# 易用性适配器

---

## 声明式接口

已实现声明式适配器入口：`CreatePortableUi`。

```typescript
import {CreatePortableUi} from 'PortableUi';

const el = document.getElementById('app');
if (!el) {
  throw new Error('Missing #app');
}

const ui = CreatePortableUi(el, {
  id: 'my-ui',
  children: {
    button1: {
      type: 'Button',
      props: {
        // Button 支持 text；适配器也兼容 label -> text
        label: 'Click Me',
        onClick: () => alert('Button 1 clicked!'),
      },
    },
    button2: {
      type: 'Button',
      props: {
        text: 'Click Me Too',
        onClick: () => alert('Button 2 clicked!'),
      },
    },
  },
});

// 通过 id 获取实例
const button1 = ui.getComponent('button1');
console.log(button1?.getId());
```

### 嵌套声明式结构

```typescript
import {CreatePortableUi} from 'PortableUi';

const el = document.getElementById('app');
if (!el) {
  throw new Error('Missing #app');
}

const ui = CreatePortableUi(el, {
  children: {
    panel: {
      type: 'Container',
      props: {
        direction: 'vertical',
        gap: 8,
      },
      children: {
        title: {
          type: 'Label',
          props: {text: '操作面板'},
        },
        action: {
          type: 'Button',
          props: {text: 'Run'},
        },
      },
    },
  },
});

// 销毁时会按逆序卸载组件
ui.destroy();
```

### 适配器返回对象

`CreatePortableUi(...)` 返回：

- `id?: string` - 根配置 id
- `root: HTMLElement` - 根容器
- `getComponent(id)` - 按 id 获取组件
- `getAllComponents()` - 获取所有已创建组件
- `destroy()` - 卸载并清理全部组件

### 更严格的类型约束（TypeScript）

适配器现在把 `type` 和对应组件 `props` 关联起来，推荐这样写：

```typescript
import {CreatePortableUi, type PortableUiDeclarativeConfig, type BuiltInDeclarativeRegistry} from 'PortableUi';

const config: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    okButton: {
      type: 'Button',
      props: {
        text: 'OK',
        // 兼容写法：label 也可用
        label: 'OK',
      },
    },
  },
};

CreatePortableUi(document.getElementById('app')!, config);
```

如果你有自定义组件，使用 `createPortableUiFactory` 能获得同样严格的类型推导；`type`、`props` 和注册表会保持联动：

```typescript
import {BaseComponent, createPortableUiFactory, type PortableUiDeclarativeConfig} from 'PortableUi';

class Badge extends BaseComponent {
  protected render(): HTMLElement {
    const el = document.createElement('span');
    el.textContent = String(this.getProps().text ?? '');
    return el;
  }
}

const registry = {Badge};
const createUi = createPortableUiFactory(registry);

const config: PortableUiDeclarativeConfig<typeof registry> = {
  children: {
    badge1: {
      type: 'Badge',
      props: {text: 'typed custom'},
    },
  },
};

const ui = createUi(document.getElementById('app')!, config);

const badge = ui.getComponent('badge1');
// badge 的类型会推导为 Badge | null
console.log(badge?.getId());
```

### 测试

新增测试文件：`test/adaptor/CreatePortableUi.test.ts`，覆盖：

- 对象形式 children 的创建与挂载
- 嵌套 children 的挂载
- 数组 children 与 `destroy()` 清理
- 未知组件类型报错

---

## 命令式接口

已实现命令式接口适配器：`App`。

```typescript
import {App} from 'PortableUi';

const el = document.getElementById('app');
if (!el) {
  throw new Error('Missing #app');
}

const root = new App(el, {id: 'root'});

root.add.Button({
  id: 'btn1',
  text: 'Click Me',
  onClick: () => alert('Button clicked!'),
});

root.add.Input({
  id: 'input1',
  placeholder: 'Type here',
});

const tab1 = root.add.Tab({
  id: 'tab1',
});

tab1.add.Button({
  id: 'tabBtn1',
  text: 'Tab Button',
  onClick: () => alert('Tab button clicked!'),
});

tab1.add.Input({
  id: 'tabInput1',
  placeholder: 'Tab input',
});


```

`App` 额外提供：

- `getComponent(id)` - 按 id 获取组件
- `getAllComponents()` - 获取当前所有组件实例
- `destroy()` - 逆序卸载并清理全部已挂载组件

`AppScope` 会根据组件注册表自动生成 `addButton()`、`addInput()` 这类方法；新增组件到列表后，会自动获得对应的 `add*()` 接口和类型提示。

除了 `addButton()` / `addInput()` 之外，你还可以直接使用 `addLabel()`、`addCheckbox()`、`addSelect()`、`addToast()`、`addTab()` 等快捷方法：

```typescript
import {App} from 'PortableUi';

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const app = new App(host, {id: 'imperative-demo'});

const title = app.add.Label({id: 'title', text: '命令式接口示例'});
const agree = app.add.Checkbox({id: 'agree', label: '我已阅读并同意'});
const theme = app.add.Select({
  id: 'theme',
  placeholder: '选择主题',
  options: [
    {label: '浅色', value: 'light'},
    {label: '深色', value: 'dark'},
  ],
});
const toast = app.add.Toast({id: 'toast', visible: false, message: '准备就绪'});

app.add.Button({
  id: 'show-toast',
  text: '显示提示',
  onClick: () => {
    toast.show(`已选择主题：${String(theme.getValue())}`, 'success');
  },
});

const tab = app.add.Tab({id: 'settings-tab'});
tab.add.Button({id: 'tab-btn', text: 'Tab 内按钮'});
tab.add.Input({id: 'tab-input', placeholder: 'Tab 内输入框'});

void title;
void agree;
```

---

## 绑定能力（Zone.js + alien-signals）

新增统一绑定能力，声明式和命令式都支持：

- 双语法并存：`node.bind`（声明式）+ 全局 `bindings`
- 变更驱动：`markDirty(path?)`
- 可选 `proxy`（默认关闭）
- 回调双签名兼容：
  - 旧签名：`(self, event, payload?)`
  - 新签名：`(ctx, self, event, payload?)`
- `alien-signals` 双形态支持：
  - 直接 signal
  - getter/setter 访问器

### 声明式示例

```typescript
import {signal} from 'alien-signals';
import {CreatePortableUi} from 'PortableUi';

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const nameSignal = signal('Alice');

const ui = CreatePortableUi(host, {
  model: {
    form: {
      name: 'Alice',
    },
    actions: {
      save: (ctx) => {
        console.log('saved name =', ctx.get('form.name'));
      },
    },
  },
  bindingOptions: {
    flush: 'microtask',
    proxy: false,
    warn: true,
  },
  children: {
    nameInput: {
      type: 'Input',
      bind: {
        // 这里会根据上方 model 自动提示路径
        value: 'form.name',
      },
      props: {
        id: 'nameInput',
      },
    },
    saveBtn: {
      type: 'Button',
      bind: {
        onClick: 'actions.save',
      },
      props: {
        id: 'saveBtn',
        text: 'Save',
      },
    },
  },
  bindings: {
    nameInput: {
      // 全局优先于 node.bind，冲突会输出开发期 warning
      value: 'form.name',
    },
  },
});

ui.markDirty('form.name');
```

提示：如果希望 IDE 对点分割路径（如 `form.profile.name`）进行自动提示和错误检查，优先使用声明式节点上的 `bind` 字段（`children.xxx.bind`）。

### 命令式示例

```typescript
import {App} from 'PortableUi';

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const app = new App(host, {
  id: 'root',
  model: {
    form: {
      email: 'alice@example.com',
    },
  },
});

const input = app.add.Input({
  id: 'email',
  bind: {
    value: 'form.email',
  },
});

app.add.Button({
  id: 'apply',
  text: 'Apply',
  bind: {
    onClick: (ctx) => {
      ctx.set('form.email', 'carol@example.com');
    },
  },
});

void input;
```

### accessor 绑定示例

```typescript
const store = {draft: 'hello'};

app.add.Input({
  id: 'draft',
  bind: {
    value: {
      get: () => store.draft,
      set: (next: string) => {
        store.draft = next;
      },
    },
  },
});
```

说明：只读 accessor（仅 `get`）绑定到可写字段时会在开发期警告并阻止写回。

### 绑定 warning code 一览

| Code | 说明 | 典型修复 |
|---|---|---|
| `BINDING_CONFLICT` | 局部 `props.bind` 与全局 `bindings` 同字段冲突，已按全局覆盖 | 删除重复绑定，保留单一来源 |
| `MISSING_BINDING_PATH` | 开启 `strict` 后绑定路径不存在 | 预先初始化模型结构或修正路径 |
| `INVALID_BINDING_SOURCE` | 绑定源类型非法 | 改为路径 / signal / accessor |
| `READONLY_BINDING_WRITE` | 向只读绑定源写入被阻止 | 提供 `set` 或改为只读展示 |
| `INVALID_CALLBACK_BINDING` | 回调路径未映射到函数 | 检查 `model.actions` 路径拼写 |

---

## Mod 场景：ModZone 工具

当 mod 在游戏启动后才被加载时，建议为 mod 创建专属 zone，并统一通过包装工具接入外部事件。

### 核心 API

- `createModZone(options)`
- `modZone.runIn(fn)`：在 mod zone 内执行
- `modZone.runOuter(fn)`：在外层 zone 执行
- `modZone.runGuarded(fn, options?)`：统一错误捕获和上报
- `modZone.wrap(callback, options?)`：自动包装外部回调到 zone
- `modZone.fork(name)`：派生子 zone

### 基础写法

```typescript
import 'zone.js';
import {createModZone, CreatePortableUi} from 'PortableUi';

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const modZone = createModZone({
  name: 'inventory-mod',
  prefix: 'GameMod',
});

const ui = modZone.runIn(() => CreatePortableUi(host, {
  model: {player: {gold: 10}},
  children: {
    goldInput: {
      type: 'Input',
      bind: {value: 'player.gold'},
    },
  },
}));

void ui;
```

### runGuarded：统一错误上报

```typescript
const modZone = createModZone({
  name: 'combat-mod',
  onError: (error, context) => {
    console.warn('[mod error]', context.phase, context.zoneName, error);
  },
});

const score = modZone.runGuarded(
  () => {
    // risky logic
    return 100;
  },
  {
    fallback: 0,
  }
);

void score;
```

### wrap：包装外部事件回调

```typescript
const onPlayerGoldChanged = modZone.wrap((nextGold: number) => {
  ui.getModel<{player: {gold: number}}>().player.gold = nextGold;
  ui.markDirty('player.gold');
});

gameApi.on('player:goldChanged', onPlayerGoldChanged);
```

可选参数：

- `outer: true`：回调在 `runOuter` 内执行
- `guarded: false`：关闭内部 try/catch
- `fallback`：抛错后返回兜底值
- `rethrow: true`：上报后继续抛出



