# Zone.js 脏检测方案（App 无全局 model）

## 目标与边界

本方案优先支持以下场景：

- `App` 全局接口不依赖统一 `model`
- 业务数据由各组件在 `bind` 中分别传入
- 不强制依赖 accessor / signals / 路径字符串全局模型
- 通过 `zone.js` 自动触发脏检测，并保留显式 `markDirty` 兜底
- 支持不同组件使用不同 `changeDetection` 策略

## 总体设计

### 核心原则

- 数据归属组件：每个组件绑定自己的 `target + key`
- 自动触发优先：`zone.js` 在任务结束或稳定后驱动检测
- 路径级优先：能拿到 deep key 时做路径级刷新；拿不到时降级对象级刷新
- 兼容现有能力：保留当前绑定能力与生命周期，不做破坏性改动

### 关键能力

1. `ObjectKeyBinding`：对象根 + 点分隔 `key`（支持 deep）
2. `ZoneScheduler` 增加 hook：任务结束/稳定时触发 dirty flush
3. `BindingEngine` 增加 target-key 索引：按对象和路径精确匹配
4. 组件级 `changeDetection`：支持 `binding/tree/hybrid` 混用
5. `App.markDirty(target, key?)`：外部场景显式触发

---

## 类型草案

```ts
export type ComponentChangeDetectionMode = 'binding' | 'tree' | 'hybrid';

export interface ObjectKeyBinding<
  TTarget extends Record<string, any> = Record<string, any>,
  TValue = any,
> {
  // 绑定对象根
  target: TTarget;

  // deep 路径，例：profile.name / settings.theme.mode
  key: string;

  // rw: 可读可写, ro: 只读展示, wo: 仅写回
  mode?: 'rw' | 'ro' | 'wo';

  // manual: 外部 markDirty, proxy: 写入自动触发
  detect?: 'manual' | 'proxy';

  // 避免重复 update
  equals?: (prev: TValue, next: TValue) => boolean;

  // 组件级覆盖
  changeDetection?: ComponentChangeDetectionMode;
}

export interface BindingOptions {
  flush?: 'microtask' | 'sync';
  warn?: boolean;
  strict?: boolean;

  // 新增：是否启用 zone 自动脏检测
  zoneAutoDirty?: boolean;

  // 全局默认 changeDetection
  changeDetection?: ComponentChangeDetectionMode;
}
```

说明：`key` 采用点分隔路径，用于 deep 变更检测；若后续需要更强类型提示，可在类型层再引入 `PathOf<T>`。

---

## 脏检测与 Zone.js 联动

### 触发时机

- `onTaskDone`：每个 zone task 完成后触发一次收集刷新
- `onMicrotaskEmpty`：队列稳定后触发一次收敛刷新

### 执行策略

- 优先刷新本轮收集到的 `(target, key)`
- 若只有 `target` 无 `key`，执行对象级刷新
- 同轮去重：同组件同属性仅刷新一次
- 重入保护：避免 tick 期间再次触发 tick

### 路径匹配规则

给定绑定路径 `bindKey` 与脏路径 `dirtyKey`：

- 完全相等命中
- `bindKey` 是 `dirtyKey` 前缀命中
- `dirtyKey` 是 `bindKey` 前缀命中

示例：

- `bindKey=profile.name` 与 `dirtyKey=profile` 命中
- `bindKey=profile` 与 `dirtyKey=profile.name` 命中

---

## 组件级 changeDetection 混用

### 模式定义

- `binding`：仅路径/对象脏标记驱动（性能优先）
- `tree`：zone 稳定后参与组件树扫描
- `hybrid`：先 `binding`，未命中时参与 `tree` 兜底

### 优先级

1. 组件显式配置（最高）
2. 父级继承（可选）
3. 全局默认 `bindingOptions.changeDetection`（最低）

### 混用规则

- 同一轮检测中，组件最终只允许一次 `update`
- `binding` 命中后可跳过 `tree` 二次刷新
- `hybrid` 在绑定命中失败时才进入树扫描

---

## App 接口建议（无全局 model）

```ts
const app = new App(host, {
  bindingOptions: {
    flush: 'microtask',
    zoneAutoDirty: true,
    changeDetection: 'binding',
  },
});

const user = { profile: { name: 'Alice' } };

app.addInput({
  id: 'nameInput',
  bind: {
    value: {
      target: user,
      key: 'profile.name',
      detect: 'manual',
      changeDetection: 'hybrid',
    },
  },
});

// 外部非 zone 场景显式触发
user.profile.name = 'Bob';
app.markDirty(user, 'profile.name');
```

新增接口：

- `markDirty(target: object, key?: string): void` - 对象级脏标记
- `markDirtyAll(target: object): void` - 对象全量脏标记
- `ctx.touch(key?: string): void` - 在回调中标记脏，等待 zone 稳定后 flush

---

## 运行时索引草案

### 索引目标

- 快速按 `target` 找绑定项
- 支持按 `key` 做路径级筛选
- 支持组件销毁时清理

### 结构建议

- `WeakMap<object, targetId>`：对象到内部 id
- `Map<targetId, Registration[]>`：对象到绑定列表
- `Map<componentId, Registration[]>`：组件到绑定列表（detach 清理）

`Registration` 建议字段：

- `componentId`
- `propName`
- `targetId`
- `key`
- `changeDetection`
- `componentRef`

---

## 最小改造清单（已完成）

### 1. `src/adaptor/types.ts`
   - ✅ 新增 `ObjectKeyBinding` 接口
   - ✅ 新增 `ComponentChangeDetectionMode` 类型
   - ✅ 扩展 `BindingOptions` 新增 `zoneAutoDirty` 和 `changeDetection`
   - ✅ 扩展 `BindingContext` 新增 `touch()` 方法
   - ✅ 扩展 `PortableUiBindingHost` 新增可选 `markDirtyObject`/`markDirtyAll` 方法

### 2. `src/adaptor/binding/ObjectBindingIndex.ts`（新文件）
   - ✅ 实现 `ObjectBindingIndex` 类：按对象和路径快速查找绑定
   - ✅ WeakMap + Map 双层索引结构
   - ✅ 支持清理和销毁

### 3. `src/adaptor/binding/ZoneScheduler.ts`
   - ✅ 增加 `ZoneSchedulerHooks` 接口（`onTaskDone`, `onMicrotaskEmpty`）
   - ✅ 在 zone spec 中实现 `onInvokeTask` 和 `onHasTask` 拦截
   - ✅ 条件为真时回调 hooks

### 4. `src/adaptor/binding/BindingEngine.ts`
   - ✅ 导入 `ObjectBindingIndex` 和新类型
   - ✅ 新增 `isObjectKeyBinding()` 检测函数
   - ✅ 维护 `pendingDirtyObjects` 数组收集脏标记
   - ✅ 实现 `onZoneTaskDone()` 和 `onZoneMicrotaskEmpty()` 方法
   - ✅ 实现 `flushCollectedDirty()` 批量刷新
   - ✅ 实现 `touchDirty()` 和 `markDirtyObject()` / `markDirtyAll()` 方法
   - ✅ 在 `attachComponent` 中处理 `ObjectKeyBinding`
   - ✅ 在 `prepareComponentBindings` 中处理 `ObjectKeyBinding` 的写回事件
   - ✅ 在 `writeBindingValue` 中处理 `ObjectKeyBinding` 写回
   - ✅ 在 `createContext` 中提供 `touch()` 实现
   - ✅ 在 `destroy` 中清理对象索引

### 5. `src/adaptor/App.ts`
   - ✅ 改造 `markDirty()` 支持对象级和路径字符串混用（重载）
   - ✅ 新增 `markDirtyAll(target)` 方法

### 6. `src/adaptor/binding/index.ts`
   - ✅ 导出 `ObjectBindingIndex` 和相关类型

---

## 新增文件

1. `src/adaptor/binding/ObjectBindingIndex.ts` - 对象级绑定索引
2. `test/adaptor/ObjectKeyBinding.test.ts` - 基础测试
3. `OBJECTKEYBINDING_GUIDE.md` - 使用指南
4. `zonejs_dirty_detect.md` - 理论设计文档

---

## 测试建议（P0）

✅ 已创建基础测试框架，建议补充：

1. deep key 双向绑定
   - `profile.name` 写回与回显

2. zone 自动脏检测
   - `setTimeout/Promise` 内修改对象后自动刷新

3. 组件级策略混用
   - 同页面 `binding + tree + hybrid` 共存

4. 外部手动兜底
   - zone 外修改后 `app.markDirty(target, key)` 生效

5. 销毁清理
   - `destroy()` 后不再触发刷新/回调

---

## 风险与应对

- 风险：`tree` 模式在大组件树开销高
  - 应对：默认 `binding`，`tree` 仅按需启用

- 风险：zone 无法天然感知具体字段路径
  - 应对：优先路径级收集，无法确定时降级对象级

- 风险：混用模式导致重复更新
  - 应对：同轮去重 + `hybrid` 仅兜底触发

---

## 结论

该方案可在不引入全局 `model` 的前提下，实现：

- ✅ 组件级数据绑定（含 deep key）
- ✅ zone 驱动的自动脏检测
- ✅ 显式脏标记兜底（`ctx.touch()` / `app.markDirty()` / `app.markDirtyAll()`）
- ✅ 不同组件 `changeDetection` 混用
- ✅ 完全向后兼容

建议先按最小改造清单落地 P0，再根据性能数据决定 `tree`/`hybrid` 默认策略。
