# PortableUi 项目架构概览

## 项目完成状态

✅ **项目架构**已完整建立
✅ **所有目录结构**已创建
✅ **核心基础设施**已实现
✅ **TypeScript 编译**无错误
✅ **DOM 访问 API** 已完成 ⭐ 新增

## 已实现的模块

### 1. 核心系统 (`src/core/`)

#### `BaseComponent.ts`
- 所有组件的基类
- 提供生命周期管理（mount, update, unmount）
- 属性和状态管理
- DOM 元素管理
- **新增: 完整的 DOM 访问和修改 API**

#### `DOMAccessor.ts`
- 灵活的 DOM 查询和操作
- 40+ 个 DOM 操作方法（详见下方）
- Shadow DOM 支持和查询
- 事件监听和管理
- 属性、样式、CSS 类管理
- 数据属性管理
- 元素克隆和遍历

#### EventSystem.ts
- 全局事件发射和监听
- 事件委托机制
- 事件历史记录
- 一次性和多次监听支持

#### StateManager.ts
- 响应式状态管理系统
- 基于 alien-signals 设计
- 状态观察者模式
- 计算属性支持
- 状态验证器
- 状态变化历史

#### StyleIsolation.ts
- Shadow DOM 样式隔离
- 防止样式污染到外部环境
- 样式缓存机制
- 隔离容器创建

### 2. 类型系统 (`src/types/`)

- **components.ts** - 组件属性、配置和生命周期类型
- **events.ts** - 事件系统的类型定义
- **state.ts** - 状态管理的类型定义

### 3. 样式系统 (`src/styles/`)

#### StyleManager.ts
- 动态样式注入和管理
- 主题管理和切换
- 样式元素生命周期管理
- 主题观察者支持

#### CSS.ts
- CSS 生成工具（stringify, rule, media queries）
- 样式合并和转换
- 动画关键帧生成
- CSS 变量支持

#### theme.ts
- 轻色和深色主题定义
- 颜色、尺寸、间距、字体配置
- 主题令牌管理

#### tokens/
- **colors.ts** - 颜色设计令牌
- **sizes.ts** - 尺寸和间距令牌
- **spacing.ts** - 间距相关的工具函数

### 4. 工具函数库 (`src/utils/`)

#### dom.ts
- DOM 元素创建和操作
- CSS 类管理
- 样式读写
- 位置信息获取
- 元素查询和查找
- 事件监听管理

#### types.ts
- 类型检查函数（isNil, isEmpty, isObject 等）
- 深度克隆和对象合并
- 类型守卫函数

#### helpers.ts
- 防抖和节流函数
- 延迟执行
- 唯一 ID 生成
- 随机数生成
- 对象路径访问（getPath, setPath）
- 重试机制
- 并发任务池
- 缓存装饰器

#### responsive.ts
- 断点管理
- 视口尺寸获取
- 媒体查询匹配
- 设备类型检测（移动设备、触摸设备）
- 主题偏好检测（暗色模式）
- 屏幕方向检测
- 实时监听器支持

### 5. 布局系统 (`src/layout/`)

#### LayoutEngine.ts
- 水平、垂直、网格布局生成
- 网格项目和弹性项目配置
- 响应式布局支持
- CSS 生成

#### LayoutTypes.ts
- 布局方向、对齐方式等类型定义
- 网格、弹性布局配置接口

### 6. 国际化系统 (`src/i18n/`)

#### I18nManager.ts
- 完整的 i18n 管理系统
- 语言切换支持
- 翻译缺失处理
- 语言变化监听
- 内置英文和中文支持

#### locales/
- **types.ts** - 翻译表类型定义（提供 TS 类型安全）
- **en.ts** - 英文翻译表
- **zh.ts** - 中文翻译表

包含的翻译键：
- common - 通用词汇
- components - 组件相关词汇
- validation - 验证消息
- messages - 系统消息

### 7. 组件库 (`src/components/`)

#### `basic/`（基础组件）
- `Button`, `Input`, `Label`, `TextBox`
- `Select`, `Checkbox`, `Radio`
- `Slider`, `DatePicker`, `FileUpload`
- `Image`, `Canvas`

这些组件已在 `src/components/basic/` 中实现并通过 `src/components/basic/index.ts` 导出。

#### `complex/`（复杂组件）
- `Table`, `TreeView`, `Tabs`
- `Modal`, `Toast`, `Progress`
- `Autocomplete`, `CascadingSelect`

这些组件已在 `src/components/complex/` 中实现并通过 `src/components/complex/index.ts` 导出。

#### `container/`（容器组件）
- `Container`, `Grid`, `Flex`, `Group`

这些组件已在 `src/components/container/` 中实现并通过 `src/components/container/index.ts` 导出。

## 主入口 (`src/index.ts`)

统一导出所有公共 API：
- 核心系统（BaseComponent, EventSystem, StateManager, DOMAccessor 等）
- 样式系统（StyleManager, CSS 工具等）
- 工具函数（dom, 类型检查、helpers 等）
- 布局系统（LayoutEngine 等）
- 国际化系统（I18nManager 等）
- 适配器系统（`CreatePortableUi`, `App`, `createPortableUiFactory`, `registerDeclarativeComponent`）
- 组件库（`basic`, `complex`, `container`）

## 单例对象

项目提供以下全局单例：

```typescript
// 核心系统
globalEventSystem: EventSystem
stateManager: StateManager
styleIsolation: StyleIsolation

// 样式系统
styleManager: StyleManager

// 国际化系统
i18nManager: I18nManager
```

## 技术特点

### 1. ⭐ 外部 DOM 访问 (核心需求)
- 完整的 DOM 访问 API（DOMAccessor）
- 组件实例上的直观方法
- Shadow DOM 内部元素查询支持
- 无限制的外部 DOM 修改能力
- 详见 DOM_ACCESS_GUIDE.md 和 DOM_ACCESS_REQUIREMENT.md

#### DOMAccessor 方法分类
| 类别 | 示例方法 | 数量 |
|-----|--------|------|
| 查询 | querySelector, querySelectorAll | 2 |
| 内容 | setHTML, setText, getHTML, getText | 4 |
| 属性 | setAttribute, getAttribute, setAttributes | 7 |
| 样式 | setStyle, getStyle, setStyles | 3 |
| CSS类 | addClass, removeClass, toggleClass, hasClass, getClasses | 5 |
| 事件 | on, off, emit, addEventListener | 4 |
| DOM操作 | appendChild, removeChild, insertBefore, replaceChild | 4 |
| 位置 | getBounds, getSize, getPosition, isVisible | 4 |
| Shadow DOM | getShadowRoot, queryShadow, queryShadowAll | 3 |
| 数据 | setData, getData, getDataValue | 3 |
| 其他 | clone, remove, clear, getElement | 4 |

### 2. 易用性
- 简洁的 API 设计
- 明确的类型定义
- 丰富的工具函数库
- 直观的组件 DOM 操作

### 2. 国际化
- 完全的 i18n 支持
- TypeScript 类型安全的翻译
- 灵活的语言切换机制

### 3. 样式隔离
- Shadow DOM 实现
- 防止全局污染
- 样式缓存优化

### 4. 响应式设计
- 完整的断点系统
- 实时媒体查询监听
- 设备检测和主题适配

### 5. 状态管理
- 响应式状态系统
- 观察者模式支持
- 计算属性支持
- 状态验证器

### 6. 事件系统
- 全局事件发射
- 事件委托
- 事件历史追踪

### 7. 模块化
- 独立的模块结构
- 清晰的依赖关系
- 易于扩展

## 下一步开发

根据 plan.md 的计划，接下来需要：

### Phase 1: 核心基础 ✅ (已完成基础设施)
- [ ] 核心系统的单元测试
- [ ] 集成测试

### Phase 2: 国际化系统 ✅ (已完成)
- [ ] i18n 测试
- [ ] 更多语言支持

### Phase 3-5: 组件库 (进行中)
- [ ] 实现所有基础组件
- [ ] 实现复杂组件
- [ ] 容器组件实现

### Phase 6-8: 优化和发布
- [ ] 性能优化
- [ ] 文档编写
- [ ] 示例代码

## 文件大小结构

```
src/
├── core/              # 核心系统 (约 5-6 KB)
├── types/             # 类型定义 (约 2-3 KB)
├── styles/            # 样式系统 (约 8-10 KB)
├── utils/             # 工具函数 (约 12-15 KB)
├── layout/            # 布局系统 (约 4-5 KB)
├── i18n/              # 国际化 (约 6-8 KB)
├── components/        # 组件库 (待开发)
└── index.ts           # 主入口 (约 1 KB)
```

**总计** (不含组件库): 约 38-50 KB

## 编译状态

✅ TypeScript 编译无错误
✅ 所有严格类型检查通过
✅ 模块导出正确配置

## 使用示例

```typescript
import {
  BaseComponent,
  DOMAccessor,  // ⭐ 新增
  globalEventSystem,
  stateManager,
  styleManager,
  i18nManager,
  LayoutEngine,
  // 更多导出...
} from 'PortableUi';

// 初始化
initialize();

// ⭐ 使用 DOM 访问 API
const button = new Button({ label: 'Click me' });
button.mount(document.body);

// 通过组件实例操作 DOM
button.setText('Updated text');
button.addClass('active');
button.on('click', () => console.log('Clicked'));
const size = button.getSize();
const shadow = button.getShadowRoot();

// 或通过 DOMAccessor 静态方法
const el = document.getElementById('my-btn');
DOMAccessor.setText(el, 'New text');
DOMAccessor.setStyles(el, { color: 'red', fontSize: '18px' });

// 使用状态管理
stateManager.createReactive('count', 0);
stateManager.observe('count', (newVal) => {
  console.log('Count changed to:', newVal);
});

// 使用事件系统
globalEventSystem.on('userAction', (event) => {
  console.log('User action:', event);
});

// 使用国际化
i18nManager.setLanguage('zh');
console.log(i18nManager.t('common.ok')); // "确定"

// 使用样式系统
styleManager.injectStyle('global', `
  .container { display: flex; }
`);

// 使用布局系统
const layoutCss = LayoutEngine.createHorizontalLayout({
  gap: '16px',
  justifyContent: 'center'
});
```

## 开发建议

1. **代码组织** - 按功能模块组织，保持单一职责
2. **类型安全** - 充分使用 TypeScript 类型系统
3. **文档** - 为所有公共 API 编写 JSDoc
4. **测试** - 为核心系统编写单元测试
5. **性能** - 定期进行性能基准测试
6. **兼容性** - 测试主流浏览器支持

---

**项目版本**: 0.1.0
**最后更新**: 2026-05-30

