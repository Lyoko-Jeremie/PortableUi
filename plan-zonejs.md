# PortableUi Zone.js + alien-signals 双向绑定改造方案

## 目标与范围

本方案用于将当前项目的 adaptor 层升级为“可绑定对象 + 可绑定回调”的统一入口，覆盖：

- 声明式 API：`CreatePortableUi(container, config[, registry])`
- 命令式 API：`new App(container, options)` + `app.add.*(props)`

并在不破坏现有组件 API 的前提下实现：

1. 绑定语法 C：`props.bind` 与全局 `bindings` 两者并存。
2. 变更检测策略 B：`zone.js` + 显式 `markDirty`，可选 `Proxy`（默认关闭，避免污染原对象）。
3. 回调上下文策略 C：双签名兼容（旧签名可继续使用，新签名可拿到上下文）。
4. 增加对 `alien-signals` 的支持，且 signals 输入形态采用 C（两者并存）：
   - 直接 `signal<T>`
   - `getter/setter` 访问器对象
5. 冲突同步优先级：给出开发期告警。
6. 文档同步：写入 `API.md` 与 `adaptor.md`。
7. 类型测试：增加 signals 双形态类型约束样例。

---

## 一、总体设计原则

### 1) 最小侵入

- 组件层（`src/components/*`）尽量不改，优先在 adaptor 层做绑定桥接。
- 保持现有 `props.onClick/onChange/...` 与 `setValue/setChecked/update` 语义。

### 2) 渐进增强

- 不使用绑定时，行为保持现状。
- 开启绑定后，新增能力对旧代码兼容。

### 3) 显式可控

- 以显式 `markDirty()` 驱动更新批处理。
- `Proxy` 只作为可选增强，默认不启用。

### 4) 类型优先

- 所有新增能力先定义类型契约，再落实现。
- 使用 typing tests 锁定行为与推断。

---

## 二、核心能力拆分

### A. 绑定语法（C：两者并存）

#### A1. 组件内绑定（局部）

每个组件 `props` 可增加 `bind` 字段。

```ts
{
  type: 'Input',
  props: {
    id: 'name',
    bind: {
      value: 'form.name',
      onInput: 'actions.handleNameInput'
    }
  }
}
```

#### A2. 全局绑定表（集中）

在 adaptor 配置中增加 `bindings`，按组件 id / key 集中管理。

```ts
{
  children: { ... },
  bindings: {
    name: {
      value: 'form.name',
      onInput: 'actions.handleNameInput'
    }
  }
}
```

#### A3. 合并策略与优先级

- 合并顺序：`props.bind` -> `bindings[idOrKey]`
- 冲突时：后者覆盖前者（即全局 `bindings` 优先）
- 开发期输出告警：
  - 组件标识（id 或 key）
  - 冲突字段（如 `value`）
  - 覆盖来源（`props.bind` -> `bindings`）

---

### B. 变更检测（B：Zone + markDirty + 可选 Proxy）

#### B1. 主流程

- 所有绑定运行在专用 Zone（如 `PortableUiBindingZone`）内。
- 业务侧在对象变更后调用 `markDirty(path?)`。
- 引擎将脏标记加入队列，在 microtask 中批量刷新绑定组件。

#### B2. 调度策略

- 默认：microtask 批处理（降低重复 rerender）
- 可配置：
  - `flush: 'microtask' | 'sync'`
  - debug 场景可用 `sync`

#### B3. 可选 Proxy（默认关闭）

- `proxy: false`（默认）：不改写原对象
- `proxy: true`：返回浅/深代理包装对象，自动在写入时触发 `markDirty`
- 约束：
  - 不替换用户传入源对象引用
  - 通过单独 `boundModel` 暴露代理结果

---

### C. 回调上下文（C：双签名兼容）

#### C1. 旧签名保持可用

例如 `Button.onClick` 继续支持：

```ts
(self, event) => void
```

#### C2. 新签名注入上下文

新增可选签名：

```ts
(ctx, self, event, ...payload) => void
```

其中 `ctx` 包含：

- `model`: 当前绑定模型
- `component`: 当前组件实例
- `adapter` 或 `app`: 所属 adaptor 对象
- `markDirty(path?)`: 手动触发刷新
- `get(path)` / `set(path, value)`: 路径读写工具
- `warn(code, detail)`: 开发期告警接口

#### C3. 运行时分发规则

- 检测函数参数长度或签名标记（推荐参数长度 + 保护兜底）
- 自动兼容旧/新签名，不要求用户迁移旧代码

---

### D. alien-signals 支持（双形态 C）

#### D1. 形态一：直接 signal

```ts
const nameSig = signal('');
bind: {
  value: nameSig
}
```

行为：

- 组件初始化读取：`nameSig()`
- 组件事件写回：`nameSig(next)`
- 通过 `effect` 订阅 signal 变化并触发组件更新

#### D2. 形态二：getter/setter 访问器

```ts
bind: {
  value: {
    get: () => store.user.name,
    set: (v) => { store.user.name = v; }
  }
}
```

行为：

- 初始化用 `get()`
- 用户输入时 `set(v)`
- 若提供 `subscribe`（可选）则自动订阅；否则依赖 `markDirty`

#### D3. computed / 只读场景

- 只读源允许 `get` 无 `set`
- 绑定到可编辑组件字段时，开发期告警“只读绑定不可写”
- 可选策略：阻止写回并保留 UI 回退

---

## 三、类型系统改造（第一优先）

目标文件：`src/adaptor/types.ts`

新增建议类型（示意）：

```ts
type PathBinding = string;

type SignalLike<T> = {
  (): T;
  (value: T): void;
};

type GetterSetterBinding<T> = {
  get: () => T;
  set?: (value: T) => void;
  subscribe?: (notify: () => void) => () => void;
};

type ValueBinding<T = any> = PathBinding | SignalLike<T> | GetterSetterBinding<T>;

type CallbackBinding = PathBinding | Function;

type ComponentBindingSpec = Record<string, ValueBinding | CallbackBinding>;

interface BindingContext {
  model: Record<string, any>;
  component: BaseComponent<any>;
  adapter?: PortableUiAdapter<any>;
  app?: App;
  markDirty: (path?: string) => void;
  get: (path: string) => any;
  set: (path: string, value: any) => void;
  warn: (code: string, detail?: Record<string, any>) => void;
}
```

并扩展：

- `PortableUiDeclarativeConfig` 增加：
  - `model?`
  - `bindings?`
  - `bindingOptions?`（flush/proxy/warn）
- `AppOptions` 增加：
  - `model?`
  - `bindings?`
  - `bindingOptions?`

---

## 四、运行时模块规划

建议新增文件：`src/adaptor/binding/`

- `BindingEngine.ts`：绑定注册、卸载、初始同步
- `ZoneScheduler.ts`：Zone 生命周期 + 批量刷新队列
- `PathAccess.ts`：路径 `get/set`（如 `a.b.c`）
- `SignalBridge.ts`：`alien-signals` 适配（signal + accessor）
- `BindingWarnings.ts`：告警码与格式化
- `types.ts`：运行时内部类型

说明：若暂不新增目录，也可先放在 `src/adaptor/` 平铺，后续再重构。

---

## 五、声明式 API 接入点

目标文件：`src/adaptor/CreatePortableUi.ts`

### 接入步骤

1. 在 `CreatePortableUi()` 初始化阶段创建 binding engine。
2. 在 `mountNode()` 里拿到每个组件实例后：
   - 解析 `props.bind`
   - 解析全局 `config.bindings[keyOrId]`
   - 合并并输出冲突告警
3. 注册字段绑定：
   - `value/checked/...` 初始化灌入组件 props
   - 事件回调包装（onInput/onChange/onClick）
4. 在 `adapter.destroy()` 中统一解除：
   - signal effect
   - accessor subscribe
   - scheduler 任务

---

## 六、命令式 API 接入点

目标文件：`src/adaptor/App.ts`

### 接入步骤

1. `new App(container, options)` 时创建 binding engine。
2. 在 `mountComponent()` 后按组件 id 注册绑定规则。
3. `app.add.*(props)` 支持 `bind` 字段。
4. `tab` 子作用域共享同一 binding engine（保证全局一致）。
5. `destroy()` 时统一解绑。

---

## 七、开发期告警规范

### 告警触发场景

1. 同字段冲突覆盖（`props.bind` 被 `bindings` 覆盖）
2. 写入只读绑定（`get` 无 `set`）
3. 绑定路径不存在（可配置 strict）
4. 回调路径解析失败
5. signal/accessor 类型不匹配

### 告警输出建议

- 仅开发环境默认开启
- 格式：`[PortableUi Binding Warn][CODE] message`
- 带结构化 detail（componentId, field, source）

---

## 八、测试计划

### 1) 行为测试

目标文件：

- `test/adaptor/CreatePortableUi.test.ts`
- `test/adaptor/App.test.ts`

新增用例建议：

1. 对象路径双向绑定（Input -> model，model -> Input）
2. 全局/局部冲突覆盖与告警
3. `markDirty()` 批量刷新
4. proxy 关闭/开启行为差异
5. 回调双签名兼容
6. signal 直连绑定
7. accessor 绑定
8. destroy 后订阅清理

### 2) 类型测试（重点）

目标文件：`test/adaptor/CreatePortableUi.typing.test.ts`

新增“signals 双形态类型约束样例”：

1. 直接 `signal<T>` 正确绑定 `value`
2. `{get,set}` 正确绑定
3. 只读 `{get}` 绑定到可写字段时报错（`@ts-expect-error`）
4. 回调双签名推断正确
5. 冲突字段类型不匹配时报错

---

## 九、文档更新计划

### 必改文件

1. `API.md`
   - 在 adaptor 章节新增：
     - `model/bindings/bindingOptions`
     - `markDirty`
     - signals 双形态绑定示例
     - 告警与优先级说明
2. `adaptor.md`
   - 新增声明式/命令式完整绑定示例
   - 增加回调双签名示例
   - 增加 signal 与 accessor 示例

### 示例片段（文档可直接复用）

```ts
import {signal} from 'alien-signals';
import {CreatePortableUi} from 'PortableUi';

const nameSig = signal('Alice');

const ui = CreatePortableUi(host, {
  model: {
    actions: {
      save: (ctx) => {
        console.log('name=', nameSig());
        ctx.markDirty();
      },
    },
  },
  children: {
    name: {
      type: 'Input',
      props: {
        bind: {
          value: nameSig,
        },
      },
    },
    saveBtn: {
      type: 'Button',
      props: {
        text: 'Save',
        bind: {
          onClick: 'actions.save',
        },
      },
    },
  },
});

void ui;
```

---

## 十、分阶段实施清单

### Phase 1：类型与基础设施

- [ ] 扩展 `src/adaptor/types.ts`
- [ ] 新增 binding runtime 模块
- [ ] 接入 `zone.js` scheduler

### Phase 2：声明式接入

- [ ] `CreatePortableUi` 绑定注册与销毁
- [ ] 局部/全局绑定合并与告警

### Phase 3：命令式接入

- [ ] `App` 与 `AppScope` 绑定接入
- [ ] `add.*` 支持 `bind`

### Phase 4：signals 与回调兼容

- [ ] signal 双形态支持
- [ ] 回调双签名分发

### Phase 5：测试与文档

- [ ] 行为测试补齐
- [ ] typing tests 增加 signals 双形态样例
- [ ] `API.md`、`adaptor.md` 更新

---

## 十一、风险与应对

1. 组件 rerender 频繁
   - 应对：microtask 批处理 + 去重队列 + 路径级脏标记
2. 回调签名歧义
   - 应对：统一 wrapper + 明确文档 + 类型提示
3. signals 与普通对象混用复杂度高
   - 应对：在 binding spec 中统一抽象 `ValueSource`
4. proxy 引入行为差异
   - 应对：默认关闭 + 显式 opt-in + 测试覆盖

---

## 十二、验收标准

满足以下条件即判定方案落地成功：

1. 声明式与命令式 API 都可直接绑定对象与回调。
2. `props.bind` 与全局 `bindings` 并存可用，冲突有开发期告警。
3. `zone.js + markDirty` 可稳定驱动批量刷新。
4. `alien-signals` 双形态（signal + getter/setter）可用。
5. 回调双签名兼容旧代码。
6. 新增测试通过，且 typing tests 覆盖双形态 signals。
7. 文档（`API.md`、`adaptor.md`）已同步更新。

---

## 十三、后续可选优化

1. 增加 DevTools 调试面板（显示 binding graph 与 dirty queue）
2. 提供 `batch(() => { ... })` API 显式合并多次更新
3. 支持更细粒度字段映射（如 transform / debounce / validate）
4. 与 `StateManager` 做深度联动，减少重复状态层

