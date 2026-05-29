# PortableUi 开发计划

## 项目概述

PortableUi 是一个便携式 UI 库，专为 Web 环境中的快速 UI 创建而设计。特别针对 Greasemonkey/Tampermonkey 脚本和游戏 Mod 等场景优化。

## 关键设计原则（优先级排序）

1. **易用性** - API 设计应简单直观，最小情况下无需手写 HTML，通过数组和对象模板创建 UI
2. **国际化** - 完整 i18n 支持，通过 TS 类型系统保证字符串查找表正确性
3. **样式隔离** - 防止组件样式与外部环境冲突
4. **兼容性** - 兼容主流浏览器，特别是用户脚本环境
5. **可维护性** - 代码清晰、结构化，易于维护和扩展
6. **模块化** - 组件独立，可单独或组合使用
7. **灵活性** - 提供足够灵活性满足不同使用场景
8. **轻量级** - 最小化库大小和资源占用

## 阶段划分

### Phase 1: 核心基础 (第1-2周)
**目标**: 建立框架和基础设施

- [x] **核心系统** (`src/core/`)
  - [x] `BaseComponent.ts` - 基础组件类、生命周期
  - [x] `EventSystem.ts` - 全局事件系统、事件委托
  - [x] `StateManager.ts` - 响应式状态管理（基于 alien-signals）
  - [x] `StyleIsolation.ts` - Shadow DOM 样式隔离方案

- [x] **样式系统** (`src/styles/`)
  - [x] `StyleManager.ts` - 动态样式注入和管理
  - [x] `CSS.ts` - CSS 生成和处理
  - [x] `theme.ts` - 主题和设计令牌（色彩、尺寸等）
  - [x] `types.ts` - 样式相关类型定义

- [x] **类型系统** (`src/types/`)
  - [x] `components.ts` - 组件类型和接口
  - [x] `events.ts` - 事件类型定义
  - [x] `state.ts` - 状态管理类型定义

### Phase 2: 国际化系统 (第2-3周)
**目标**: 完善 i18n 系统，实现类型安全的多语言支持

- [x] **国际化模块** (`src/i18n/`)
  - [x] `I18nManager.ts` - 国际化管理器
  - [x] `types.ts` - i18n 类型系统
  - [x] 本地化文件：
    - [x] `locales/zh.ts` - 简体中文
    - [x] `locales/en.ts` - 英文
    - [x] `locales/types.ts` - 翻译表类型定义

- [x] 创建 i18n 类型检查工具（通过 TypeScript 编译期类型约束实现）
- [x] 文档：i18n 使用指南（I18N_GUIDE.md）

### Phase 3: 基础组件 (第3-5周)
**目标**: 实现所有基础 UI 组件

- [x] **基础组件** (`src/components/basic/`)
  - [x] `Button.ts` - 按钮组件
  - [x] `Input.ts` - 文本输入框
  - [x] `Label.ts` - 标签
  - [x] `TextBox.ts` - 多行文本框
  - [x] `Select.ts` - 下拉框
  - [x] `Checkbox.ts` - 复选框
  - [x] `Radio.ts` - 单选框
  - [x] `Slider.ts` - 滑动条
  - [x] `DatePicker.ts` - 日期选择器
  - [x] `FileUpload.ts` - 文件上传

- [ ] 为每个组件编写单元测试
- [ ] 创建示例和文档

### Phase 4: 布局系统 (第4-5周)
**目标**: 建立灵活高效的布局系统

- [ ] **布局系统** (`src/layout/`)
  - [ ] `LayoutEngine.ts` - 布局引擎核心
  - [ ] `LayoutTypes.ts` - 布局类型定义

- [ ] **布局容器** (`src/components/container/`)
  - [ ] `Container.ts` - 基础容器
  - [ ] `Grid.ts` - 网格布局
  - [ ] `Flex.ts` - 弹性布局
  - [ ] `Group.ts` - 分组容器

### Phase 5: 复杂组件 (第5-7周)
**目标**: 实现高级组件

- [ ] **复杂组件** (`src/components/complex/`)
  - [ ] `Table.ts` - 数据表格
  - [ ] `TreeView.ts` - 树形视图
  - [ ] `Tabs.ts` - 标签页
  - [ ] `Modal.ts` - 模态框/对话框
  - [ ] `Toast.ts` - 消息提示/通知
  - [ ] `Progress.ts` - 进度条

### Phase 6: 专项功能 (第6-7周)
**目标**: 实现媒体支持和响应式设计

- [ ] **媒体支持**
  - [ ] `Image.ts` - 图片组件
  - [ ] `Canvas.ts` - Canvas 组件

- [ ] **响应式设计**
  - [ ] `src/utils/responsive.ts` - 响应式工具
  - [ ] 媒体查询支持
  - [ ] 尺寸检测和自适应

### Phase 7: 高级功能 (第7-8周)
**目标**: 性能优化和可扩展性

- [ ] **性能优化**
  - [ ] 虚拟滚动（Table, TreeView）
  - [ ] 懒加载机制
  - [ ] 组件缓存策略
  - [ ] 打包和 Tree-shaking 优化

- [ ] **可扩展性**
  - [ ] 插件系统
  - [ ] 自定义组件 API
  - [ ] 中间件系统
  - [ ] 钩子（Hooks）系统

- [x] **工具函数** (`src/utils/`)
  - [x] `dom.ts` - DOM 操作工具
  - [x] `types.ts` - 类型工具
  - [x] `helpers.ts` - 辅助函数

### Phase 8: 文档和发布 (第8-9周)
**目标**: 完整的文档和示例

- [ ] 编写完整的 API 文档
- [ ] 创建交互式示例页面
- [ ] 编写集成指南
- [ ] 编写最佳实践文档
- [ ] 性能基准测试
- [ ] 版本管理和发布流程

## 项目架构

```
src/
├── index.ts                    # 主入口，导出所有公共 API
├── core/                       # 核心系统
│   ├── BaseComponent.ts        # 基础组件类
│   ├── EventSystem.ts          # 事件系统
│   ├── StateManager.ts         # 状态管理
│   └── StyleIsolation.ts       # 样式隔离
├── components/                 # 组件库
│   ├── basic/                  # 基础组件
│   │   ├── Button.ts
│   │   ├── Input.ts
│   │   ├── Label.ts
│   │   ├── TextBox.ts
│   │   ├── Select.ts
│   │   ├── Checkbox.ts
│   │   ├── Radio.ts
│   │   ├── Slider.ts
│   │   ├── DatePicker.ts
│   │   ├── FileUpload.ts
│   │   ├── Image.ts
│   │   ├── Canvas.ts
│   │   └── index.ts            # 组件导出
│   ├── complex/                # 复杂组件
│   │   ├── Table.ts
│   │   ├── TreeView.ts
│   │   ├── Tabs.ts
│   │   ├── Modal.ts
│   │   ├── Toast.ts
│   │   ├── Progress.ts
│   │   └── index.ts
│   └── container/              # 容器组件
│       ├── Container.ts
│       ├── Grid.ts
│       ├── Flex.ts
│       ├── Group.ts
│       └── index.ts
├── layout/                     # 布局系统
│   ├── LayoutEngine.ts
│   ├── LayoutTypes.ts
│   └── index.ts
├── i18n/                       # 国际化
│   ├── I18nManager.ts
│   ├── types.ts
│   ├── locales/
│   │   ├── en.ts
│   │   ├── zh.ts
│   │   └── types.ts
│   └── index.ts
├── styles/                     # 样式系统
│   ├── StyleManager.ts
│   ├── CSS.ts
│   ├── theme.ts
│   ├── types.ts
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── sizes.ts
│   │   └── spacing.ts
│   └── index.ts
├── utils/                      # 工具函数
│   ├── dom.ts
│   ├── types.ts
│   ├── helpers.ts
│   ├── responsive.ts
│   └── index.ts
└── types/                      # 类型定义
    ├── components.ts
    ├── events.ts
    ├── state.ts
    └── index.ts
```

## 技术栈

- **语言**: TypeScript
- **状态管理**: alien-signals (响应式系统)
- **工具库**: lodash
- **日期处理**: moment
- **样式隔离**: Shadow DOM
- **模块系统**: ESNext

## 开发规范

### 文件命名
- 组件文件：PascalCase (Button.ts, TextInput.ts)
- 工具文件：camelCase (styleManager.ts, domUtils.ts)
- 类型文件：types.ts (统一命名)

### 代码结构
- 每个组件为独立文件/类
- 导出 index.ts 聚合同目录下的所有导出
- 类型定义与实现分离
- 重复代码提取到工具函数

### 文档要求
- 每个公共 API 必须有 JSDoc 注释
- 复杂组件配备使用示例
- 类型定义包含详细说明

### 测试要求
- 单元测试覆盖率 >= 80%
- 集成测试覆盖主要功能流程
- 兼容性测试验证浏览器支持

## 里程碑

| 里程碑 | 目标 | 时间 |
|------|------|------|
| M1 | 核心系统和类型系统完成 | 第2周 |
| M2 | 国际化系统完成 | 第3周 |
| M3 | 所有基础组件完成 | 第5周 |
| M4 | 布局系统和复杂组件完成 | 第7周 |
| M5 | 高级功能和优化完成 | 第8周 |
| M6 | 文档完成和 v1.0 发布 | 第9周 |

## 成功标准

- ✅ 所有计划中的组件按时完成
- ✅ 代码测试覆盖率 >= 80%
- ✅ 完整的 API 文档和示例
- ✅ 零外部样式污染
- ✅ 主流浏览器兼容（IE11 及以上）
- ✅ 库大小 < 100KB (gzipped)
- ✅ 完整的国际化支持
