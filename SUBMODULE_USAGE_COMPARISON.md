# Git Submodule 使用方式完整对比与选择指南

PortableUi 库支持通过 git submodule 的两种使用方式。本文详细对比两种方式，帮助你做出最适合你的项目的选择。

## 📊 快速对比

| 特性 | 方式 A | 方式 B |
|------|--------|--------|
| **名称** | 使用预编译的 dist | 直接使用源代码 |
| **输入文件** | `dist/`（JavaScript + 声明） | `src/`（TypeScript） |
| **编译步骤** | 需要在 submodule 中运行 `yarn build` | 无需额外构建步骤 |
| **谁做编译** | PortableUi 库 | 你的项目（webpack/vite/tsc） |
| **配置难度** | ⭐⭐ 简单 | ⭐⭐⭐ 中等 |
| **初始化时间** | 较慢（需要 install + build） | 快速（仅 git clone） |
| **类型获取** | 预编译的 `.d.ts` 文件 | 实时从源代码生成 |
| **调试友好度** | 🟡 需要 source maps | 🟢 原始 TypeScript |
| **打包体积** | 🟢 优化（预处理） | 🟡 依赖工具优化 |
| **性能开销** | 🟢 低（预编译） | 🟡 中（实时编译） |
| **生产环境** | 🟢 推荐 | 🟡 可用 |
| **开发环境** | 🟢 可用 | 🟢 推荐 |

## 🎯 方式 A：使用预编译的 dist

### 原理

```
PortableUi 仓库
  ↓
  yarn build  (生成 dist/)
  ↓
  dist/       (JavaScript + TypeScript 声明)
  ↓
你的项目通过 paths 或 exports 指向 dist/
  ↓
直接使用编译后的代码
```

### 完整步骤

```bash
# 1. 添加 submodule
git submodule add <repo-url> submodules/PortableUi

# 2. 进入 submodule 并构建
cd submodules/PortableUi
yarn install
yarn build       # ← 关键步骤
cd ../..

# 3. 配置你的项目 tsconfig.json
{
  "paths": {
    "PortableUi": ["./submodules/PortableUi"]
  }
}

# 4. 开始使用
import { Button } from 'PortableUi';
```

### 优点

✅ **稳定性最高**
- 编译过程由库维护者控制
- 确保 dist 的一致性和完整性
- 避免编译环境差异导致的问题

✅ **最优化的输出**
- 库维护者可以应用特定的编译选项
- 打包工具可以更好地进行 tree-shaking
- 可能包含 tree-shaking 友好的注释（sideEffects）

✅ **最兼容的生态**
- npm 包的标准用法
- 所有工具都有最好的支持
- 最接近生产环境的使用方式

✅ **最清晰的依赖关系**
- dist/ 中的内容完全确定，无歧义
- 类型定义与 JavaScript 完全对齐
- 避免不同编译器的微妙差异

✅ **最佳的性能**
- 不需要在使用时编译库代码
- 加快项目的整体编译速度

### 缺点

❌ **需要额外的构建步骤**
- 必须在 submodule 中运行 `yarn install && yarn build`
- 增加初始化时间

❌ **团队协作需要同步通知**
- 如果库更新，所有使用者都需要重新构建
- 分布式团队需要确保构建环境一致

❌ **调试库代码较复杂**
- 需要依赖 source maps
- 修改源代码后需要重新构建

### 适用场景

✅ **生产环境** → 最佳选择
```typescript
// 生产应用 - 使用方式 A
import { Button, Input } from 'PortableUi';
```

✅ **大型项目** → 推荐
- 编译流程清晰
- 依赖关系明确

✅ **稳定性优先** → 推荐
- 需要可复现的构建
- 需要与 npm 包一致的行为

## 🔧 方式 B：直接使用源代码

### 原理

```
PortableUi 仓库
  ↓
  src/        (TypeScript 源文件)
  ↓
你的项目的编译工具直接编译 src/
(webpack + ts-loader / vite / parcel 等)
  ↓
在你的项目编译过程中产生最终代码
```

### 完整步骤

```bash
# 1. 添加 submodule（仅此而已！）
git submodule add <repo-url> submodules/PortableUi

# 2. 配置你的项目 tsconfig.json
{
  "baseUrl": ".",
  "paths": {
    "PortableUi": ["./submodules/PortableUi/src"],
    "PortableUi/*": ["./submodules/PortableUi/src/*"]
  }
}

# 3. 配置你的构建工具（自动处理编译）
# webpack.config.js 或 vite.config.ts（自动读取 tsconfig paths）

# 4. 开始使用
import { Button } from 'PortableUi';

# 5. 构建你的项目
webpack build 或 vite build
```

### 优点

✅ **最小化集成步骤**
- 无需在 submodule 中额外构建
- `git submodule add` 后直接可用

✅ **最快的迭代开发**
- 修改库代码立即生效（热更新）
- 无需等待单独的 build 步骤
- 开发流程最简洁

✅ **最灵活的编译选项**
- 使用与项目一致的 TypeScript/Babel 配置
- 享受项目现有的所有编译优化
- 可以针对不同环境进行不同编译

✅ **最简的调试体验**
- 直接调试 TypeScript 源代码
- IDE 提供完整的源代码跳转
- 修改源代码后立即看到效果（开发模式下）

✅ **最少的磁盘空间**
- 无需额外的 dist 目录
- 存储库更轻量级

### 缺点

❌ **编译复杂性**
- 项目编译时间可能增加（需要编译库代码）
- 编译工具必须支持 TypeScript

❌ **兼容性风险**
- 库的源代码依赖项必须与你的项目兼容
- 不同的 TypeScript/Babel 版本可能产生差异编译结果
- 需要更多的测试确保库代码在你的环境中正常工作

❌ **不稳定的输出**
- 同一份源代码在不同编译环境产出可能不同
- 难以调试跨项目的编译差异

❌ **库代码暴露更多细节**
- 源代码中的注释和代码结构对最终用户可见
- 可能泄露库的实现细节

### 适用场景

✅ **快速原型开发** → 最佳选择
```typescript
// 快速试验 - 使用方式 B
import { Button } from 'PortableUi';
// 修改后立即测试，无需 rebuild
```

✅ **活跃的库开发** → 推荐
- 频繁修改库代码
- 需要快速反馈循环

✅ **现代构建工具** → 推荐
- 项目已使用 webpack 5+ / vite
- 构建工具能完美处理 TypeScript

✅ **同一个团队维护** → 推荐
- 库和应用代码同时迭代
- 完全控制编译环境

## 🚀 决策流程

```
你需要通过 git submodule 使用 PortableUi
    ↓
问题 1：这是生产环境代码吗？
  ├─ YES → 倾向方式 A
  └─ NO  → 继续问题 2
    ↓
问题 2：需要快速迭代和调试库代码吗？
  ├─ YES → 倾向方式 B
  └─ NO  → 继续问题 3
    ↓
问题 3：团队规模和 TypeScript 版本一致吗？
  ├─ YES → 方式 B 可行
  └─ NO  → 选择方式 A
    ↓
问题 4：编译时间是关键瓶颈吗？
  ├─ YES → 方式 A（预编译更快）
  └─ NO  → 两者均可，选择更方便的
```

### 决策矩阵

|  | 生产优先 | 开发优先 |
|---|--------|--------|
| **小型项目** | 方式 A | 方式 B |
| **大型项目** | 方式 A | 方式 A（稳定性更重要） |
| **活跃开发** | 方式 A | 方式 B ✅ |
| **长期维护** | 方式 A ✅ | 方式 A |
| **CI/CD 流程** | 方式 A ✅ | 方式 A |

## 📝 实际时间对比

### 方式 A 的流程时间

```
git submodule add              2s
cd submodule && yarn install   30-60s  (首次)
yarn build                     10-20s
总计：                          42-82s (首次)
后续更新：                      10-20s
```

### 方式 B 的流程时间

```
git submodule add              2s
配置 tsconfig                   1s
开始开发                        即刻
总计：                          3s ✅ 快 27 倍!
后续更新：                      0s（仅 git pull）
webpack 编译时间增加：          +2-5s
```

**注意**：方式 B 虽然集成快，但每次编译会增加库代码的编译时间。

## 💡 最佳实践建议

### 🟢 强烈推荐方式 A 的场景

```typescript
// 生产应用
npm run build:prod
// 需要最稳定最可靠的代码 → 方式 A
```

### 🟢 强烈推荐方式 B 的场景

```typescript
// 库和应用同步开发
git submodule add PortableUi
yarn start  // 立即开始开发，无需库的额外构建 → 方式 B
```

### 🟡 两者都可以的场景

```typescript
// 特定应用场景，灵活选择
// 取决于具体是原型还是生产
```

## 🔄 在两种方式之间切换

从方式 B 切换到方式 A：

```bash
# 构建 dist
cd submodules/PortableUi
yarn build
cd ../..

# 更新 tsconfig.json
# 从 "paths": { "PortableUi": ["./submodules/PortableUi/src"] }
# 改为 "paths": { "PortableUi": ["./submodules/PortableUi"] }

# 清理并重新编译
rm -rf dist
yarn build
```

从方式 A 切换到方式 B：

```bash
# 更新 tsconfig.json
# 从 "paths": { "PortableUi": ["./submodules/PortableUi"] }
# 改为 "paths": { "PortableUi": ["./submodules/PortableUi/src"] }

# 清理并重新编译
rm -rf dist
yarn build  # 或 webpack build、vite build 等
```

## 📚 相关文档

| 文档 | 适用方式 |
|------|---------|
| `GIT_SUBMODULE_GUIDE.md` | 方式 A（详细指南） |
| **本文档** | 两种方式对比 |
| `GIT_SUBMODULE_NO_BUILD_GUIDE.md` | 方式 B（详细指南） |
| `examples/SUBMODULE_USAGE.md` | 方式 A（实践示例） |
| `examples/tsconfig.submodule.example.json` | 方式 A（配置示例） |
| `examples/tsconfig.submodule.no-build.example.json` | 方式 B（配置示例） |

## 🤔 常见问题

### Q: 我能在开发时使用方式 B，生产时用方式 A 吗？
A: 可以！使用条件编译或环境变量切换 tsconfig paths。

### Q: 方式 B 编译出的代码与方式 A 相同吗？
A: 不一定。取决于:
- TypeScript 版本
- 编译选项（target、lib 等）
- 第三方编译工具的配置

### Q: 方式 B 能用于 npm 依赖吗？
A: 可能不能。npm 包不支持源代码使用，只有 git submodule 才可以。

### Q: 我应该提交 dist/ 到版本控制吗？
A: 
- 方式 A：不需要，由 `yarn build` 生成
- 方式 B：不需要，不生成 dist
- 发布到 npm 时：dist/ 会被包含（via `files` 字段）

### Q: 如何解决方式 B 中的类型不匹配错误？
A:
1. 检查 TypeScript 版本一致性
2. 更新 tsconfig 的 `lib` 和 `target` 配置
3. 如问题持续，切换回方式 A

## 🎓 总结

| 需求 | 推荐方式 | 理由 |
|------|---------|------|
| 生产发布 | 🟢 方式 A | 最稳定可靠 |
| 快速开发 | 🟢 方式 B | 最小化集成 |
| 大团队 | 🟢 方式 A | 流程清晰 |
| 单人项目 | 🟢 方式 B | 最轻量级 |
| CI/CD | 🟢 方式 A | 可重现构建 |
| 原型设计 | 🟢 方式 B | 快速迭代 |

**最终建议**：除非你有特殊的快速开发需求，**建议使用方式 A**。它提供了最高的稳定性、最佳的性能和最清晰的依赖关系。

