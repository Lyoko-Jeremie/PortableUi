# PortableUi

这是一个便携式UI库，用于在Web环境中快速创建一个用户界面。

设计用于 Greasemonkey/Tampermonkey 脚本，也用于游戏Mod等注入场景。

这个库在使用时通常是以Greasemonkey或Mod的形式注入到已有的环境中，需要保证环境的样式不影响当前库的元素，当前库的样式也不影响环境。

## 当前已实现

- **基础组件**：`Button`、`Input`、`Label`、`TextBox`、`Select`、`Checkbox`、`Radio`、`Slider`、`DatePicker`、`FileUpload`、`Image`、`Canvas`
- **复杂组件**：`Table`、`TreeView`、`Tabs`、`Modal`、`Toast`、`Progress`、`Autocomplete`、`CascadingSelect`
- **布局容器**：`Container`、`Flex`、`Grid`、`GridItem`、`Group`
- **核心能力**：`BaseComponent`、`DOMAccessor`、`EventSystem`、`StateManager`、`StyleManager`、`StyleIsolation`、`LayoutEngine`、`I18nManager`
- **两种适配器入口**：`CreatePortableUi`（声明式）和 `App`（命令式）
- **统一入口**：`src/index.ts` 会导出核心、类型、样式、工具、布局、i18n、适配器以及全部组件模块

这些能力已经覆盖了库的主要使用场景：注入式 UI、Shadow DOM 样式隔离、组件树管理、国际化与布局组合。

## 关键设计原则

按优先级：
1. **易用性**：API设计应该简单直观，易于理解和使用。最小情况下可以完全不编写HTML代码，直接通过操作数组和对象模板来创建和管理UI组件。
2. **i18n**：库应该支持国际化，允许用户轻松地本地化字符串。且应该提供一个简单的接口来管理和切换语言。且能通过TS类型系统来保证字符串查找表的正确性。
3. **样式隔离**：库应该提供一种机制来隔离组件的样式，避免与外部环境的样式冲突。
4. **兼容性**：库应该兼容主流浏览器和环境，特别是用户脚本环境。
5. **可维护性**：代码应该清晰、结构化，易于维护和扩展。
6. **模块化**：组件应该是独立的，可以单独使用或组合使用。
7. **灵活性**：库应该提供足够的灵活性，以满足不同用户的需求和使用场景。
8. **轻量级**：库应该尽可能小，以减少加载时间和资源占用。

## 示例构建（Webpack 多页面）

项目现在支持将 `examples` 目录构建为多个独立 HTML 页面。

- 输出目录：`dist/examples`
 - 输出页面：`basic.html`、`complex.html`、`layout.html`、`media.html`、`imperative.html`、`tabs.html`

常用命令：

```bash
yarn build:examples
yarn build:examples:prod
yarn dev:examples
```

执行 `yarn dev:examples` 后，默认会启动开发服务器并打开 `basic.html`。

如果你想直接查看命令式接口示例，可以打开 `imperative.html`。

## 使用文档

- 布局系统：`docs/LAYOUT_GUIDE.md`
- 可扩展性：`docs/EXTENSIBILITY_GUIDE.md`

