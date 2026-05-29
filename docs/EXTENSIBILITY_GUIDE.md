# 可扩展性使用文档

## 概述

PortableUi 通过以下四个能力支持扩展：

- **插件系统**：安装/卸载插件，集中扩展库能力。
- **自定义组件 API**：通过 `defineComponent` 快速定义组件。
- **中间件系统**：拦截组件生命周期，做日志、鉴权、埋点等横切逻辑。
- **Hooks 系统**：监听生命周期前后、取消和错误事件。

当前生命周期扩展点覆盖：`mount`、`update`、`unmount`。

## 快速开始

```typescript
import {
  BaseComponent,
  defineComponent,
  extensibilityManager,
  type PortableUiPlugin,
} from 'portable-ui';
```

## 1) 自定义组件 API

使用 `defineComponent` 可以通过一个渲染函数快速创建组件类。

```typescript
import {defineComponent} from 'portable-ui';

interface BadgeProps {
  text?: string;
  className?: string;
}

const Badge = defineComponent<BadgeProps>({
  defaultProps: {text: 'Default Badge'},
  render: (props) => {
    const el = document.createElement('span');
    el.className = ['portableui-badge', props.className ?? ''].filter(Boolean).join(' ');
    el.textContent = props.text ?? '';
    return el;
  },
});

const badge = new Badge({text: 'New'});
badge.mount(document.body);
```

### 要点

- `defaultProps` 会与实例化传入的 `props` 合并。
- `render(props, self)` 中的 `self` 即当前组件实例，可访问 `BaseComponent` API。

## 2) 组件注册中心

可将组件注册为命名工厂，按名称动态创建。

```typescript
import {BaseComponent, extensibilityManager} from 'portable-ui';

class Card extends BaseComponent {
  protected render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'card';
    el.textContent = 'Card';
    return el;
  }
}

extensibilityManager.components.register('demo.card', Card);

const card = extensibilityManager.components.create('demo.card');
card.mount(document.body);

console.log(extensibilityManager.components.has('demo.card')); // true
console.log(extensibilityManager.components.list()); // ['demo.card']

extensibilityManager.components.unregister('demo.card');
```

## 3) 插件系统

插件用于打包一组扩展行为（组件、hooks、中间件等）。

```typescript
import {
  BaseComponent,
  extensibilityManager,
  type PortableUiPlugin,
} from 'portable-ui';

class AlertBox extends BaseComponent {
  protected render(): HTMLElement {
    const el = document.createElement('div');
    el.className = 'alert-box';
    el.textContent = 'Alert';
    return el;
  }
}

const AlertPlugin: PortableUiPlugin = {
  name: 'alert-plugin',
  version: '1.0.0',
  install(api) {
    api.registerComponent('plugin.alert', AlertBox);

    api.tapHook('afterMount', (component) => {
      console.log('[alert-plugin] mounted:', component.getElement()?.className);
    });
  },
  uninstall(api) {
    api.unregisterComponent('plugin.alert');
  },
};

extensibilityManager.plugins.use(AlertPlugin);

const instance = extensibilityManager.components.create('plugin.alert');
instance.mount(document.body);

extensibilityManager.plugins.uninstall('alert-plugin');
```

### 插件 API

`install(api)` 中可使用：

- `api.registerComponent(name, component)`
- `api.unregisterComponent(name)`
- `api.hasComponent(name)`
- `api.useMiddleware(middleware)`（返回卸载函数）
- `api.tapHook(hook, handler)`（返回卸载函数）

## 4) Hooks 系统

### 可用 Hook 名称

- `beforeMount`
- `afterMount`
- `beforeUpdate`
- `afterUpdate`
- `beforeUnmount`
- `afterUnmount`
- `cancelled`
- `error`

### 使用示例

```typescript
import {extensibilityManager} from 'portable-ui';

const disposeBeforeMount = extensibilityManager.hooks.tap('beforeMount', (component) => {
  console.log('before mount:', component);
});

const disposeError = extensibilityManager.hooks.tap('error', (_component, payload) => {
  console.error('lifecycle error:', payload);
});

// 取消监听
disposeBeforeMount();
disposeError();
```

## 5) 中间件系统

中间件签名：

```typescript
type Middleware = (context, next) => void;
```

`context` 字段：

- `phase`: `'mount' | 'update' | 'unmount'`
- `component`: 当前组件
- `payload`: 生命周期附带数据
- `cancel`: 是否取消当前生命周期操作
- `metadata`: 中间件共享数据对象

### 示例：记录耗时

```typescript
import {extensibilityManager} from 'portable-ui';

const disposeTiming = extensibilityManager.middleware.use((context, next) => {
  const start = performance.now();
  next();
  const duration = performance.now() - start;
  console.log(`[${context.phase}] ${duration.toFixed(2)}ms`);
});

// 取消中间件
disposeTiming();
```

### 示例：取消某类组件挂载

```typescript
import {extensibilityManager} from 'portable-ui';

const disposeBlocker = extensibilityManager.middleware.use((context, next) => {
  if (context.phase === 'mount' && context.component.getProps().id === 'blocked') {
    context.cancel = true;
    return;
  }

  next();
});

// 取消中间件
disposeBlocker();
```

## 6) 生命周期与扩展执行顺序

以 `mount` 为例：

1. 触发 `beforeMount` hooks
2. 执行中间件链
3. 若 `context.cancel === false`，执行原始生命周期逻辑
4. 触发 `afterMount` hooks
5. 若取消，则触发 `cancelled`
6. 若抛错，则触发 `error` 并继续抛出

`update` 和 `unmount` 顺序一致，只是 hook 名称对应变化。

## 7) 最佳实践

- 插件命名使用域前缀，如 `acme.table-tools`，避免冲突。
- 中间件务必在合适时机调用 `next()`，避免阻塞链路。
- 中间件仅在明确需求下设置 `cancel`，避免出现隐式行为。
- 在 `uninstall` 中回收注册组件和监听器，避免内存泄漏。
- 把跨组件能力放在插件中，单组件能力放在 `defineComponent`。

## 8) 常见问题

### Q: `setState()` 会触发 `beforeUpdate/afterUpdate` 吗？
当前不会。扩展生命周期仅接入 `mount/update/unmount`，其中 `update()` 会触发更新相关 hooks/middleware。

### Q: 插件重复安装会怎样？
`extensibilityManager.plugins.use(plugin)` 对同名插件会抛错。

### Q: 中间件里抛异常会怎样？
会触发 `error` hook，然后继续向外抛出异常。

## 参考

- 核心实现：`src/core/Extensibility.ts`
- 自定义组件：`src/core/CustomComponent.ts`
- 生命周期接入：`src/core/BaseComponent.ts`
- 回归测试：`test/core/Extensibility.test.ts`

