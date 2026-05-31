# PortableUi API Reference (LLM-Friendly)

> 目标：让调用方的 LLM 在最短上下文内，准确理解 `src/` 里的可用 API、调用方式和关键约束。

## LLM Ultra-Short Prompt (Copy/Paste)

```text
你是 PortableUi 调用助手。优先使用以下路径：
1) 声明式渲染：CreatePortableUi(container, config[, registry])
2) 命令式渲染：new App(container, options) + addXxx(props)

关键规则：
- 默认样式隔离是 shadow；可选 none/scoped/shadow。
- 组件 id 不能重复（CreatePortableUi/App 会抛错）。
- 所有组件继承 BaseComponent，支持 mount/update/unmount/getElement。
- 组件回调签名通常是 (self, event, ...)。
- i18n 语言类型目前仅 'en' | 'zh'。

常用单例：stateManager, globalEventSystem, styleManager, i18nManager, extensibilityManager。
输出代码时优先给最小可运行示例，且显式包含容器与销毁逻辑。
```

## LLM JSON Index

```json
{
  "library": "PortableUi",
  "version": "0.1.0",
  "entry": {
    "main": "src/index.ts",
    "exports": [
      "core",
      "types",
      "styles",
      "utils",
      "layout",
      "i18n",
      "adaptor",
      "components/basic",
      "components/complex",
      "components/container"
    ]
  },
  "primary_apis": {
    "declarative": {
      "name": "CreatePortableUi",
      "signature": "CreatePortableUi(container, config, registry?) => PortableUiAdapter",
      "default_style_isolation": "shadow",
      "config_keys": ["id", "children", "styleIsolation.mode", "styleIsolation.styles"],
      "adapter_methods": ["getComponent", "getAllComponents", "destroy"],
      "adapter_fields": ["id", "root", "shadowRoot"]
    },
    "imperative": {
      "name": "App",
      "signature": "new App(container, options)",
      "features": [
        "auto generated addXxx methods",
        "addTab returns AppScope",
        "getComponent/getAllComponents/destroy",
        "shadowRoot access"
      ]
    }
  },
  "singletons": [
    "stateManager",
    "globalEventSystem",
    "styleManager",
    "i18nManager",
    "extensibilityManager",
    "styleIsolation"
  ],
  "core": {
    "BaseComponent": [
      "mount",
      "update",
      "unmount",
      "destroy",
      "getElement",
      "getProps",
      "getState",
      "setState"
    ],
    "helpers": ["defineComponent", "DOMAccessor"],
    "systems": ["EventSystem", "StateManager", "StyleIsolation", "ExtensibilityManager"]
  },
  "components": {
    "basic": [
      "Button",
      "Input",
      "Label",
      "TextBox",
      "Select",
      "Checkbox",
      "Radio",
      "Slider",
      "DatePicker",
      "FileUpload",
      "Image",
      "Canvas"
    ],
    "complex": [
      "Table",
      "TreeView",
      "Tabs",
      "Modal",
      "Toast",
      "Progress",
      "Autocomplete",
      "CascadingSelect"
    ],
    "container": ["Container", "Flex", "Grid", "GridItem", "Group"]
  },
  "styles": {
    "manager": "StyleManager",
    "css_builder": "CSS",
    "themes": ["lightTheme", "darkTheme", "getDefaultTheme"],
    "tokens": ["colors", "sizes", "spacing"]
  },
  "layout": {
    "engine": "LayoutEngine",
    "apis": [
      "createHorizontalLayout",
      "createVerticalLayout",
      "createGridLayout",
      "createGridItemLayout",
      "createFlexItemLayout",
      "createLayoutWrapper",
      "createResponsiveLayout"
    ]
  },
  "i18n": {
    "apis": ["I18nManager", "i18nManager", "i18n"],
    "languages": ["en", "zh"],
    "built_in_locales": ["enUS", "zhCN"]
  },
  "constraints": [
    "component ids must be unique in CreatePortableUi/App",
    "default style isolation mode is shadow",
    "component callbacks usually use (self, event, ...)",
    "BaseComponent.update usually triggers rerender"
  ]
}
```

## 0. 快速结论（给 LLM 的最小可执行知识）

- 主入口：`src/index.ts`，直接导出核心、类型、样式、布局、i18n、适配器、全部组件。
- 两种主要构建 UI 的方式：
  - **声明式**：`CreatePortableUi(container, config[, registry])`
  - **命令式**：`new App(container, options)` + `addXxx(...)`
- 默认样式隔离模式是 `shadow`（Shadow DOM）。
- 所有组件都继承 `BaseComponent`，通用生命周期与 DOM API 一致。
- 常用全局单例：`stateManager`、`globalEventSystem`、`styleManager`、`i18nManager`、`extensibilityManager`。

---

## 1. 包入口与导出总览

```ts
import * as PUI from 'PortableUi';
// 或按需导入
import {
  CreatePortableUi,
  App,
  Button,
  stateManager,
  globalEventSystem,
  styleManager,
  i18nManager,
} from 'PortableUi';
```

`src/index.ts` 导出模块：

- `./core`
- `./types`
- `./styles`
- `./utils`
- `./layout`
- `./i18n`
- `./adaptor`
- `./components/basic`
- `./components/complex`
- `./components/container`
- `version: '0.1.0'`
- `initialize(): void`

---

## 2. 统一基础类型

### 2.1 `ComponentProps`

所有组件 props 的基类（`src/types/components.ts`）：

```ts
interface ComponentProps {
  id?: string;
  className?: string;
  style?: Record<string, string>;
  [key: string]: any;
}
```

### 2.2 事件与状态类型

- 事件：`PortableEvent`、`EventListener`、`EventEmitOptions`
- 状态：`StateObserver`、`StateChangeEvent`、`ReactiveOptions`、`ComputedOptions`

---

## 3. Core API（`src/core`）

## 3.1 `BaseComponent`（所有组件基类）

核心调用：

- 生命周期：`mount(container)` / `update(partialProps)` / `unmount()` / `destroy()`
- 数据访问：`getId()` / `getProps()` / `getState()` / `setState(...)` / `isMounted()`
- 元素访问：`getElement()`
- 组件查询（范围内）：
  - `findComponentById(id)`
  - `findChildComponents(deep?)`
  - `findParentComponent()`
  - 静态：`queryComponentById(container, id)` 等
- DOM 快捷操作（代理到 `DOMAccessor`）：
  - 查询：`querySelector` / `querySelectorAll`
  - 内容：`setHTML` / `getHTML` / `setText` / `getText`
  - 属性和样式：`setAttribute` / `setStyles` / `addClass` ...
  - 事件：`on` / `off` / `emit`
  - 尺寸位置：`getBounds` / `getSize` / `getPosition`

约束：

- 若不传 `id`，构造时会自动生成（`{ComponentName}_{random}`）。
- `update()` 在已挂载状态会触发重渲染。

## 3.2 `defineComponent`

快速定义组件（无需手写 class）：

```ts
const Badge = defineComponent({
  defaultProps: { text: 'New' },
  render: (props) => {
    const el = document.createElement('span');
    el.textContent = props.text;
    return el;
  },
});
```

## 3.3 `EventSystem` + `globalEventSystem`

- 监听：`on(eventName, listener, options?) => unsubscribe`
- 一次性监听：`once(...)`
- 触发：`emit(eventName, data?, options?)`
- 管理：`off` / `clear` / `getHistory` / `listenerCount` / `eventNames` / `destroy`

## 3.4 `StateManager` + `stateManager`

- 创建响应式状态：`createReactive(key, initialValue, options?)`
- 读写：`get(key)` / `set(key, value)` / `batch({...})`
- 订阅：`observe(key, observer) => unobserve`
- 计算属性：`createComputed` / `getComputed`
- 管理：`getAll` / `reset` / `delete` / `clear` / `getHistory`

## 3.5 `ExtensibilityManager` + `extensibilityManager`

- 组件注册：`components.register/unregister/has/create/list`
- 中间件：`middleware.use(...)`
- 生命周期钩子：`hooks.tap(hook, handler)`
- 插件：`plugins.use/uninstall/has/list`
- 生命周期拦截执行：`runLifecycle(...)`（内部由 `BaseComponent` 使用）

支持钩子：

- `beforeMount` / `afterMount`
- `beforeUpdate` / `afterUpdate`
- `beforeUnmount` / `afterUnmount`
- `cancelled` / `error`

## 3.6 `StyleIsolation` + `styleIsolation`

Shadow DOM 样式隔离工具类：

- `createShadowRoot(host, styles?)`
- `appendStyles(shadowRoot, styles, cacheKey?)`
- `removeShadowRoot(host)`
- `createIsolatedContainer(styles, content?)`
- `clear` / `clearStyleCache` / `getStats` / `destroy`

---

## 4. Adaptor API（高频入口）

## 4.1 声明式：`CreatePortableUi`

签名（简化）：

```
CreatePortableUi(container, config, registry?) => PortableUiAdapter
```

`config`：

```ts
interface PortableUiDeclarativeConfig<TRegistry> {
  id?: string;
  children: DeclarativeChildren<TRegistry>; // 对象或数组
  model?: Record<string, any>;             // 绑定模型
  bindings?: Record<string, Record<string, any>>; // 全局绑定表，按 key/id 组织
  bindingOptions?: {
    flush?: 'microtask' | 'sync';
    proxy?: boolean; // 默认 false
    warn?: boolean;  // 默认 true
    strict?: boolean;
  };
  styleIsolation?: {
    mode?: 'none' | 'scoped' | 'shadow'; // 默认 shadow
    styles?: string;
  };
}
```

`PortableUiAdapter`：

- `id?: string`
- `root: HTMLElement`（实际挂载根）
- `shadowRoot: ShadowRoot | null`
- `getComponent(id)`
- `getAllComponents()`
- `destroy()`
- `boundModel: Record<string, any>`（绑定模型引用，proxy=true 时为代理对象）
- `getModel<T>()`
- `markDirty(path?)`

最小示例：

```ts
const adapter = CreatePortableUi(container, {
  id: 'demo',
  children: {
    submitBtn: { type: 'Button', props: { text: '提交' } },
    nameInput: { type: 'Input', props: { placeholder: '请输入姓名' } },
  },
  styleIsolation: { mode: 'shadow' },
});

adapter.getComponent('submitBtn');
adapter.markDirty('form.name');
```

补充：

- 对 `Button` 支持 `label -> text` 兼容映射。
- `registerDeclarativeComponent(type, ctor)` 可扩展内建声明式组件表。
- `createPortableUiFactory(registry)` 可生成绑定自定义 registry 的工厂函数。
- 声明式绑定支持两种写法并存：
  - 局部（强类型推荐）：`children.xxx.bind`
  - 全局：`config.bindings[keyOrId]`
  - 冲突时全局覆盖局部，并输出开发期警告。
  - `children.xxx.bind` 会基于 `config.model` 提供点路径自动提示与类型检查。

声明式绑定示例（含 `alien-signals`）：

```ts
import {signal} from 'alien-signals';

const nameSig = signal('Alice');

const adapter = CreatePortableUi(container, {
  model: {
    form: {name: 'Alice'},
    actions: {
      save: (ctx) => {
        console.log(ctx.get('form.name'));
      },
    },
  },
  children: {
    nameInput: {
      type: 'Input',
      bind: {
        // 基于 model 的路径提示
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
        text: 'Save',
      },
    },
  },
  bindings: {
    nameInput: {
      // 全局绑定优先于 props.bind（会告警）
      value: 'form.name',
    },
  },
});

adapter.markDirty('form.name');
```

## 4.2 命令式：`App`

```ts
const app = new App(container, {
  id: 'root',
  rootProps: { direction: 'vertical', gap: 8 },
  styleIsolation: { mode: 'shadow' },
  model: { form: { email: '' } },
  bindingOptions: { flush: 'microtask', proxy: false },
});

const btn = app.add.Button({ id: 'okBtn', text: 'OK' });
const tabScope = app.add.Tab({ id: 'tab1' });
tabScope.add.Input({ id: 'name' });
```

特性：

- `App` 自动生成 `addXxx(props)`（来自内建组件 registry）。
- `addTab(options)` 返回子 `AppScope`，用于分区追加组件。
- `getComponent(id)` / `getAllComponents()` / `destroy()` / `getShadowRoot()`。
- `boundModel` / `getModel<T>()` / `markDirty(path?)`。

命令式绑定示例（路径 + accessor + 双签名回调）：

```ts
const app = new App(container, {
  id: 'root',
  model: {
    form: {email: 'a@example.com'},
  },
});

const input = app.add.Input({
  id: 'email',
  bind: {
    value: 'form.email',
  },
});

app.add.Button({
  id: 'save',
  text: 'Save',
  bind: {
    // 新签名：ctx + 旧参数
    onClick: (ctx, self, event) => {
      ctx.set('form.email', 'saved@example.com');
    },
  },
});

void input;
```

`alien-signals` 绑定输入形态：

- 直接 signal：`value: mySignal`
- getter/setter：

```ts
const binding = {
  value: {
    get: () => store.name,
    set: (next) => {
      store.name = next;
    },
  },
};
```

注：只读 computed 在类型层不能完全区分可写 signal，运行时会阻止写回并给出开发期警告。

绑定 warning code（开发期）：

| Code | 触发条件 | 建议处理 |
|---|---|---|
| `BINDING_CONFLICT` | `props.bind` 与全局 `bindings[key/id]` 同字段冲突，全局覆盖局部 | 统一绑定来源，避免同字段重复定义 |
| `MISSING_BINDING_PATH` | `bindingOptions.strict=true` 且路径不存在 | 检查模型结构或提前初始化路径 |
| `INVALID_BINDING_SOURCE` | 字段绑定源既不是路径，也不是 signal/accessor | 修正为合法绑定源 |
| `READONLY_BINDING_WRITE` | 写回发生在只读源（如无 `set` accessor） | 改为可写源或改用只读展示字段 |
| `INVALID_CALLBACK_BINDING` | 回调路径未解析到函数 | 检查 `model.actions.*` 路径和函数声明 |

---

## 5. 组件 API

> 所有组件都支持 `ComponentProps`（`id/className/style`）。

### 5.1 基础组件（`src/components/basic`）

- `Button`
  - props: `text`, `type`, `disabled`, `onClick(self,event)`
  - methods: `setText`, `setDisabled`
- `Input`
  - props: `type`, `value`, `placeholder`, `disabled`, `readonly`, `required`, `name`, `autocomplete`, `minLength`, `maxLength`, `onInput`, `onChange`
  - methods: `getValue`, `setValue`, `focus`, `blur`
- `Label`
  - props: `text`, `htmlFor`
  - methods: `setText`
- `TextBox`
  - props: `value`, `placeholder`, `rows`, `cols`, `disabled`, `readonly`, `required`, `resize`, `onInput`, `onChange`
  - methods: `getValue`, `setValue`
- `Select`
  - props: `options`, `value`, `multiple`, `disabled`, `required`, `name`, `placeholder`, `onChange`
  - methods: `getValue`, `setValue`, `setOptions`
- `Checkbox`
  - props: `checked`, `disabled`, `required`, `name`, `value`, `label`, `indeterminate`, `onChange`
  - methods: `isChecked`, `setChecked`
- `Radio`
  - props: `checked`, `disabled`, `required`, `name`, `value`, `label`, `onChange`
  - methods: `isChecked`, `setChecked`
- `Slider`
  - props: `min`, `max`, `step`, `value`, `disabled`, `showValue`, `onInput`, `onChange`
  - methods: `getValue`, `setValue`
- `DatePicker`
  - props: `value`, `min`, `max`, `disabled`, `required`, `onChange`
  - methods: `getValue`, `setValue`
- `FileUpload`
  - props: `accept`, `multiple`, `disabled`, `capture`, `onChange`
  - methods: `getFiles`, `clearFiles`
- `Image`
  - props: `src`, `alt`, `width`, `height`, `loading`, `decoding`, `crossOrigin`, `referrerPolicy`, `onLoad`, `onError`
  - methods: `getSrc`, `setSrc`, `setAlt`
- `Canvas`
  - props: `width`, `height`, `contextType`, `contextAttributes`, `onReady`, `onDraw`, `onClick`
  - methods: `getCanvasElement`, `getContext`, `clear`, `setSize`, `toDataURL`

### 5.2 复杂组件（`src/components/complex`）

- `Table<T>`
  - props: `columns`, `data`, `bordered`, `striped`, `hoverable`, `emptyText`, `onRowClick`
  - methods: `setRows`, `setColumns`, `getData`, `appendRow`, `clearRows`
- `TreeView`
  - props: `nodes`, `selectedId`, `expandedIds`, `selectable`, `onSelect`, `onToggle`
  - methods: `setNodes`, `setSelectedId`, `setExpandedIds`, `expandAll`, `collapseAll`
- `Tabs`
  - props: `tabs`, `activeTabId`, `stretch`, `onTabChange`
  - `tabs` item: `{ id: string; title: string; content: Container; disabled?: boolean }`
  - methods: `setTabs`, `appendTab`, `setActiveTab`, `getActiveTabId`
- `Modal`
  - props: `visible`, `title`, `content`, `width`, `confirmText`, `cancelText`, `showFooter`, `showCloseButton`, `closeOnOverlayClick`, `onOpen`, `onClose`, `onConfirm`, `onCancel`
  - methods: `open`, `close`, `toggle`, `setTitle`, `setContent`
- `Toast`
  - props: `message`, `visible`, `type`, `duration`, `closable`, `onClose`
  - methods: `show`, `hide`, `setMessage`, `setType`
- `Progress`
  - props: `value`, `min`, `max`, `showLabel`, `labelFormatter`, `indeterminate`, `color`, `height`
  - methods: `setValue`, `increment`, `setRange`
- `Autocomplete`
  - props: `value`, `placeholder`, `options`, `minChars`, `maxResults`, `onInput`, `onSelect`, `filter`
  - methods: `getValue`, `setValue`, `setOptions`
- `CascadingSelect`
  - props: `options`, `valuePath`, `placeholder`, `onChange`
  - methods: `setValuePath`, `getValuePath`, `setOptions`

### 5.3 布局容器组件（`src/components/container`）

- `Container`
  - props: `direction`, `justifyContent`, `alignItems`, `gap`, `padding`, `backgroundColor`, `width`, `height`, `minHeight`, `wrap`, `children`
  - methods: `addChild`, `removeContainerChild`, `clearChildren`, `getContainerChildren`, `setChildren`
- `Flex`（继承 `Container`）
  - extra props: `grow`, `shrink`, `basis`, `inline`
- `Grid`（继承 `Container`）
  - extra props: `columns`, `rows`, `columnGap`, `rowGap`, `autoRows`, `autoColumns`
  - static: `Grid.createItem(props?)`
- `GridItem`
  - props: `columnSpan`, `rowSpan`, `children`
  - methods: `addChild`, `getChildrenList`
- `Group`（继承 `Container`）
  - extra props: `title`, `titlePosition`, `bordered`, `borderColor`, `borderWidth`, `borderStyle`, `borderRadius`, `backgroundColor`

---

## 6. 样式系统 API（`src/styles`）

## 6.1 `StyleManager` / `styleManager`

- 样式注入：`injectStyle(id, css, target?)` / `updateStyle` / `removeStyle`
- 主题：`setTheme(theme)` / `getTheme()` / `observeTheme(...)`
- 主题读取：`getThemeColor` / `getThemeSize` / `getThemeSpacing` / `getThemeFont`
- 工具：`prefixClass` / `applyTheme`
- 清理：`clear` / `destroy` / `getStyleIds`

## 6.2 `CSS` 工具类

- `stringify(styleObj)`
- `rule(selector, declarations)`
- `rules(ruleArray)`
- `media(condition, rules)`
- `merge(...styles)`
- `toKebabCase` / `toCamelCase`
- `var(name, value)` / `varRef(name, fallback?)`
- `prefixed(prefix, selector)`
- `keyframes(name, frames)`

## 6.3 Theme 与 Tokens

- `lightTheme` / `darkTheme` / `getDefaultTheme`
- `defaultColors` / `defaultSizes` / `defaultSpacing` / `defaultFonts`
- `colors` / `sizes` / `spacing`
- `spacing_horizontal`, `spacing_vertical`, `padding_horizontal`, `padding_vertical`

---

## 7. 布局引擎 API（`src/layout`）

`LayoutEngine`：

- `createHorizontalLayout(config)`
- `createVerticalLayout(config)`
- `createGridLayout(config)`
- `createGridItemLayout(config)`
- `createFlexItemLayout(config)`
- `createLayoutWrapper(config)`
- `createResponsiveLayout(baseConfig, breakpoints)`

类型：`LayoutConfig`, `GridConfig`, `GridItemConfig`, `FlexConfig`。

---

## 8. i18n API（`src/i18n`）

导出：

- `I18nManager`
- `i18nManager`（全局实例）
- `i18n`（类型安全点语法访问器）
- `zhCN` / `enUS`
- `LocaleStrings` / `LocaleStringKey`

常用调用：

```ts
i18nManager.setLanguage('zh');
const text = i18nManager.t('common.ok');
const dynamic = i18n.components.modal.title; // 点语法
```

监听：

- `onLanguageChange(listener)`
- `onTranslationMissing(listener)`

注意：当前 `Language` 类型定义为 `'en' | 'zh'`。

---

## 9. Utils API（`src/utils`）

## 9.1 DOM 工具

- `createElement`
- `addClass` / `removeClass` / `toggleClass` / `hasClass`
- `setStyle` / `getStyle`
- `getPosition` / `getPositionRelativeTo` / `isInViewport` / `findClosest`
- `addEventListener`（返回取消函数）
- `removeAllChildren`

## 9.2 类型与对象工具

- `isNil`, `isEmpty`, `isObject`, `isArray`, `isString`, `isNumber`, `isBoolean`, `isFunction`
- `deepClone`, `merge`, `deepMerge`, `isInstanceOf`

## 9.3 通用 helper

- `debounce`, `throttle`, `delay`
- `generateId`, `randomBetween`
- `getPath`, `setPath`
- `retry`, `promisePool`, `memoize`

## 9.4 响应式环境工具

- 常量：`breakpoints`
- 视口：`getViewportWidth`, `getViewportHeight`
- 断点：`isAboveBreakpoint`, `isBelowBreakpoint`, `getCurrentBreakpoint`
- 媒体查询：`matchesMedia`, `onMediaQueryChange`
- 监听：`onViewportChange`, `onDarkModeChange`
- 设备：`isMobileDevice`, `isTouchDevice`, `getDevicePixelRatio`, `isLandscape`, `isPortrait`, `isDarkMode`

---

## 10. 典型调用模板（供 LLM 直接复用）

### 模板 A：声明式渲染 + Shadow 样式隔离

```ts
import {CreatePortableUi} from 'PortableUi';

const host = document.getElementById('app')!;
const adapter = CreatePortableUi(host, {
  id: 'demo-ui',
  styleIsolation: {
    mode: 'shadow',
    styles: '.portableui-button { padding: 6px 12px; }',
  },
  children: {
    submit: {type: 'Button', props: {text: 'Submit'}},
    q: {type: 'Input', props: {placeholder: 'Search...'}},
  },
});

adapter.getComponent('submit');
// adapter.destroy();
```

### 模板 B：命令式 App API

```ts
import {App} from 'PortableUi';

const app = new App(document.body, {
  id: 'mainApp',
  rootProps: {direction: 'vertical', gap: 10, padding: 12},
});

app.addLabel({text: 'Account'});
app.addInput({id: 'username', placeholder: 'username'});
app.addButton({id: 'loginBtn', text: 'Login'});
```

### 模板 C：组件实例控制

```ts
import {Modal} from 'PortableUi';

const modal = new Modal({title: 'Confirm', content: 'Delete item?'});
modal.mount(document.body);
modal.open();
```

---

## 11. 关键行为与坑点（LLM 生成代码时应遵守）

- `CreatePortableUi` / `App` 会检查重复组件 `id`，重复会抛错。
- 声明式 `styleIsolation.mode` 默认是 `shadow`，`root` 可能在 Shadow 内部挂载点。
- 组件回调签名普遍是 `(self, event, ...)`，第一个参数始终是组件实例。
- `BaseComponent.update()` 通常会整体 rerender；持有旧 DOM 引用时要重新获取。
- i18n 的 `Language` 类型目前仅 `'en' | 'zh'`，扩展新语言时需同步类型定义。

---

## 12. API 参考索引（按文件）

- 入口：`src/index.ts`
- 核心：`src/core/*`
- 适配器：`src/adaptor/*`
- 基础组件：`src/components/basic/*`
- 复杂组件：`src/components/complex/*`
- 布局组件：`src/components/container/*`
- 样式：`src/styles/*`
- 布局引擎：`src/layout/*`
- 国际化：`src/i18n/*`
- 工具：`src/utils/*`

## 13. 场景检索索引（先看这里）

- 目标：**快速创建一组 UI（最短路径）**
  - 首选：`CreatePortableUi`（见「4.1 声明式」）
  - 关注：`PortableUiAdapter.getComponent/getAllComponents/destroy`
- 目标：**逐步拼装页面、边写边加组件**
  - 首选：`App`（见「4.2 命令式」）
  - 关注：`addXxx` 自动方法、`addTab`、`getComponent`
- 目标：**写自定义组件**
  - 首选：继承 `BaseComponent` 或 `defineComponent`
  - 关注：`mount/update/unmount`、`render()`、回调签名 `(self, event, ...)`
- 目标：**表单输入与交互**
  - 看：`Input`、`TextBox`、`Select`、`Checkbox`、`Radio`、`DatePicker`、`FileUpload`
  - 可配：`stateManager`（状态）、`globalEventSystem`（跨组件事件）
- 目标：**数据展示**
  - 表格：`Table<T>`
  - 层级数据：`TreeView`
  - 分步选择：`CascadingSelect`
  - 搜索建议：`Autocomplete`
- 目标：**弹层与反馈**
  - 模态框：`Modal`（`open/close/toggle`）
  - 轻提示：`Toast`（`show/hide`、自动关闭）
  - 进度：`Progress`
- 目标：**布局排版**
  - 直接组件：`Container` / `Flex` / `Grid` / `Group`
  - 底层样式生成：`LayoutEngine`
- 目标：**样式主题和 CSS 生成**
  - 全局注入与主题：`styleManager`
  - 规则拼装：`CSS.rule/rules/media/keyframes`
  - 设计令牌：`colors/sizes/spacing`
- 目标：**i18n 多语言**
  - 管理器：`i18nManager.setLanguage/t`
  - 点语法：`i18n.xxx.yyy`
  - 内置语言：`enUS`、`zhCN`
- 目标：**插件扩展和生命周期拦截**
  - 看：`extensibilityManager`（`middleware`、`hooks`、`plugins`）
  - 声明式扩展：`registerDeclarativeComponent`
