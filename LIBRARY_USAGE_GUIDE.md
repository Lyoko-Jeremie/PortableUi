# PortableUi 库 - 三种使用方式完整指南

PortableUi 库支持三种主要的使用方式，适应不同的项目需求。本文档汇总所有使用方式，帮助你快速找到适合的集成方案。

## 🎯 三种使用方式概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    PortableUi 支持的使用方式                      │
├─────────────────────────────────────────────────────────────────┤
│ 方式 1：NPM 包                                                    │
│ └─ npm install PortableUi                                       │
│    自动获得 dist/，无需额外配置，最简单 ✅                       │
│                                                                  │
│ 方式 2：Git Submodule + 编译（推荐）                             │
│ └─ git submodule add + yarn build                              │
│    使用预编译的 dist/，最稳定 ✅                                 │
│                                                                  │
│ 方式 3：Git Submodule + 直接源码（快速开发）                    │
│ └─ git submodule add（无需 yarn build）                         │
│    直接使用 src/，快速集成 ✅                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📲 方式 1：NPM 包（推荐用于生产）

### 使用场景

✅ 最终用户/消费者
✅ 生产环境应用
✅ 不需要修改库代码
✅ CloudFlare Workers、Deno 等特殊环境

### 快速开始

```bash
npm install PortableUi
# 或
yarn add PortableUi
```

### 项目配置

无需额外配置！直接导入：

```typescript
import { Button, Input } from 'PortableUi';

const app = new Button({
  label: 'Click me',
  onClick: () => console.log('Clicked!')
});
```

### 工作原理

```
npm 仓库
  ↓
contains only dist/（files 字段）
  ↓
npm install
  ↓
node_modules/PortableUi/dist/
  ↓
你的项目直接使用
```

### 优点

✅ **最简单**：无需任何配置
✅ **最可靠**：官方维护的版本
✅ **最快速**：npm CDN 加速
✅ **最稳定**：预编译的产物

### 相关文档

📖 [npm: PortableUi](https://www.npmjs.com/package/PortableUi)（发布后可用）

---

## 🔀 方式 2：Git Submodule + 编译（推荐用于贡献者）

### 使用场景

✅ 库的贡献者 / 核心开发者
✅ 需要修改库代码但想使用预编译版本
✅ 团队需要统一的编译流程
✅ 生产环境且需要完整控制

### 快速开始

```bash
# 1. 添加 submodule
git submodule add <repo-url> submodules/PortableUi

# 2. 初始化并构建
cd submodules/PortableUi
yarn install      # 安装依赖
yarn build        # 生成 dist/
cd ../..

# 3. 配置你的项目 tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./submodules/PortableUi"]
      // 自动指向 dist/（通过 package.json 的 exports）
    }
  }
}

# 4. 开始使用
import { Button } from 'PortableUi';
```

### 工作原理

```
Git Submodule（完整源码）
  ↓
yarn build （生成 dist/）
  ↓
package.json: "exports" → dist/
  ↓
TypeScript paths 映射
  ↓
你的项目使用预编译的 dist/
```

### 优点

✅ **最稳定**：预编译的产物
✅ **最优化**：库维护者优化
✅ **最清晰**：依赖关系明确
✅ **最安全**：远离源代码变化的影响

### 缺点

❌ 需要额外的初始化步骤（yarn install + build）
❌ 修改库代码后需要重新构建
❌ 分布式团队需要同步通知

### 详细指南

📖 [Git Submodule 完整指南](./GIT_SUBMODULE_GUIDE.md)

### 配置示例

📄 [tsconfig.submodule.example.json](./examples/tsconfig.submodule.example.json)

### 使用示例

📄 [SUBMODULE_USAGE.md](./examples/SUBMODULE_USAGE.md)

### 验证清单

📋 [SUBMODULE_INTEGRATION_CHECKLIST.md](./SUBMODULE_INTEGRATION_CHECKLIST.md)

---

## ⚡ 方式 3：Git Submodule + 直接源码（推荐用于快速开发）

### 使用场景

✅ 快速原型开发
✅ 库的活跃开发
✅ 需要修改库代码并立即测试
✅ 开发环境（不是生产）

### 快速开始

```bash
# 1. 添加 submodule（仅此！）
git submodule add <repo-url> submodules/PortableUi

# 2. 配置你的项目 tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./submodules/PortableUi/src"],
      // 直接指向源代码（不需要 dist/）
      "PortableUi/*": ["./submodules/PortableUi/src/*"]
    }
  }
}

# 3. 开始使用（项目编译时会编译库代码）
import { Button } from 'PortableUi';

# 4. 构建你的项目
webpack build  # 或 vite build、tsc 等
```

### 工作原理

```
Git Submodule（完整源码）
  ↓
你的项目编译工具（webpack/vite/tsc）
  ↓
自动编译库的源代码
  ↓
最终产物包含库的代码
```

### 优点

✅ **最快的集成**：无需额外 build 步骤
✅ **最灵活的开发**：改源码立即生效
✅ **最简的调试**：直接调试原始 TypeScript
✅ **最高的迭代速度**：无构建延迟

### 缺点

❌ 项目编译时间增加（需编译库代码）
❌ 编译工具必须支持 TypeScript
❌ 不同环境可能产生不同编译结果
❌ 不适合生产环境

### 详细指南

📖 [不编译使用指南](./GIT_SUBMODULE_NO_BUILD_GUIDE.md)

### 配置示例

📄 [tsconfig.submodule.no-build.example.json](./examples/tsconfig.submodule.no-build.example.json)

---

## 🔄 两种 Git Submodule 方式对比

### 速查表

| 维度 | 方式 2（+编译） | 方式 3（直接源码） |
|------|-----------|-------------|
| **初始化时间** | ⏱️ 较长 (~1min) | ⏱️ 快速 (~2sec) |
| **编译速度** | 🟢 快（预编译） | 🟡 较慢（需编译库）|
| **编译稳定性** | 🟢 最稳定 | 🟡 依赖工具 |
| **调试体验** | 🟡 依赖 source maps | 🟢 原始源码 |
| **开发效率** | 🟡 需要 rebuild | 🟢 即时生效 |
| **生产就绪** | 🟢 推荐 | 🟡 不推荐 |
| **学习曲线** | 🟢 简单 | 🟡 需要工具知识 |

### 完整对比

📄 [详细对比与决策指南](./SUBMODULE_USAGE_COMPARISON.md)

---

## 📋 决策树

```
我想使用 PortableUi
    ↓
是否需要修改库代码？
├─ NO  → 使用 NPM（方式 1） ✅ 最简单
└─ YES → 继续...
    ↓
需要快速迭代和测试？
├─ YES → 使用 Submodule 直接源码（方式 3）✅ 最快
└─ NO  → 使用 Submodule + 编译（方式 2）✅ 最稳定
```

---

## 🛡️ 所有方式中的隔离保证

无论使用哪种方式，以下机制都确保你**不会意外引入 test 或 examples**：

### 隔离层级

```
1️⃣ package.json 的 exports 和 typesVersions
   ↓ 仅暴露 dist/ 或 src/（公共 API）
   ↓ test 和 examples 完全隐藏

2️⃣ src/index.ts 的显式导出
   ↓ 仅导出库的公共组件和函数
   ↓ 完全不导出任何 test 或 examples 中的内容

3️⃣ npm 发布时的 .npmignore
   ↓ 发布包仅包含 dist/
   ↓ test 和 examples 永远不进入 npm

4️⃣ .gitignore
   ↓ 确保开发时的临时文件不提交
```

### 验证

所有方式下，你都可以验证没有引入 test/examples：

```bash
# 对于 npm 方式：
find node_modules/PortableUi -name "*test*" -o -name "*examples*"
# 应输出为空

# 对于 Submodule 方式：
grep -r "test\|examples" dist/
# 应输出为空（方式 2）

# 对于直接源码方式：
# 仅导入 src/，不导入 test/ 或 examples/
```

---

## 🔗 完整文档导航

### 📚 使用方式指南

| 方式 | 主指南 | 配置示例 | 使用示例 | 对比 |
|------|--------|----------|----------|------|
| **1. NPM** | - | - | README.md | - |
| **2. Submodule + 编译** | [GIT_SUBMODULE_GUIDE.md](./GIT_SUBMODULE_GUIDE.md) | [配置](./examples/tsconfig.submodule.example.json) | [示例](./examples/SUBMODULE_USAGE.md) | [对比](./SUBMODULE_USAGE_COMPARISON.md) |
| **3. Submodule + 源码** | [GIT_SUBMODULE_NO_BUILD_GUIDE.md](./GIT_SUBMODULE_NO_BUILD_GUIDE.md) | [配置](./examples/tsconfig.submodule.no-build.example.json) | [本小节](#-方式-3git-submodule--直接源码推荐用于快速开发) | [对比](./SUBMODULE_USAGE_COMPARISON.md) |

### 🔧 技术文档

| 文档 | 内容 |
|------|------|
| [SUBMODULE_SOLUTION_SUMMARY.md](./SUBMODULE_SOLUTION_SUMMARY.md) | 多层隔离机制说明 |
| [SUBMODULE_INTEGRATION_CHECKLIST.md](./SUBMODULE_INTEGRATION_CHECKLIST.md) | 验证清单和常见问题 |

### 🎯 快速参考

| 我想... | 建议 | 指南 |
|--------|------|------|
| 安装并使用库 | 使用 NPM（方式 1） | [npm registry](https://www.npmjs.com/package/PortableUi) |
| 快速开始开发 | Submodule + 源码（方式 3） | [快速指南](#-方式-3git-submodule--直接源码推荐用于快速开发) |
| 生产环境集成 | NPM 或 Submodule + 编译（方式 1/2） | 根据需求选择 |
| 贡献库代码 | Submodule + 编译（方式 2） | [贡献指南](./GIT_SUBMODULE_GUIDE.md) |
| 对比两种方式 | 查看决策指南 | [SUBMODULE_USAGE_COMPARISON.md](./SUBMODULE_USAGE_COMPARISON.md) |

---

## ✅ 三种方式的验证

### 方式 1：NPM

```bash
npm install PortableUi
npm list PortableUi
# 应显示版本信息
```

### 方式 2：Submodule + 编译

```bash
git submodule status
# 应显示 submodule 状态

ls submodules/PortableUi/dist/
# 应包含编译的 JavaScript 和声明文件

tsc --listFiles | grep PortableUi
# 应显示来自 dist/ 的类型
```

### 方式 3：Submodule + 源码

```bash
git submodule status
# 应显示 submodule 状态

ls submodules/PortableUi/src/
# 应包含 TypeScript 源文件

tsc --listFiles | grep PortableUi
# 应显示来自 src/ 的类型
```

---

## 💡 推荐组合

### 个人项目 & 打包应用
```
方式 1（NPM）
↓
最简单、最快速、最可靠
```

### 团队项目 & 生产应用
```
方式 1（NPM）用于生产
+ 方式 2（Submodule + 编译）用于开发
↓
清晰分离，便于协作
```

### 库的开发者 & 快速迭代
```
方式 3（Submodule + 源码）
↓
最快的开发循环
```

### 开源贡献 & 长期维护
```
方式 2（Submodule + 编译）
↓
最稳定、最专业
```

---

## 🔧 从一种方式迁移到另一种

### NPM → Submodule

```bash
# 1. 移除 npm 包
npm uninstall PortableUi

# 2. 添加 submodule
git submodule add <repo-url> submodules/PortableUi

# 3. 更新 imports
// 从
import { Button } from 'PortableUi';
// 改为（如果需要手动配置）
import { Button } from 'PortableUi';  // 通过 tsconfig paths
```

### 方式 2 ↔ 方式 3

```bash
# 两种方式共存，通过 tsconfig 的 paths 配置切换
# 改 paths 的目标即可：
// 方式 2（编译）: "PortableUi": ["./submodules/PortableUi"]
// 方式 3（源码）: "PortableUi": ["./submodules/PortableUi/src"]
```

---

## 🚀 更快地开始

### 5 分钟快速开始（NPM）
```bash
npm install PortableUi
cat > main.ts << 'EOF'
import { Button } from 'PortableUi';
const btn = new Button({ label: 'Hello!' });
EOF
tsc main.ts && node main.js
```

### 10 分钟快速开始（Submodule + 源码）
```bash
git submodule add <repo-url> submodules/PortableUi
cat > tsconfig.json << 'EOF'
{ "compilerOptions": { "paths": { "PortableUi": ["./submodules/PortableUi/src"] } } }
EOF
cat > main.ts << 'EOF'
import { Button } from 'PortableUi';
const btn = new Button({ label: 'Hello!' });
EOF
tsc && node main.js
```

### 15 分钟完整开始（Submodule + 编译）
```bash
git submodule add <repo-url> submodules/PortableUi
cd submodules/PortableUi && yarn install && yarn build && cd ../..
cat > tsconfig.json << 'EOF'
{ "compilerOptions": { "paths": { "PortableUi": ["./submodules/PortableUi"] } } }
EOF
cat > main.ts << 'EOF'
import { Button } from 'PortableUi';
const btn = new Button({ label: 'Hello!' });
EOF
tsc && node main.js
```

---

## 📬 反馈和支持

遇到问题？
- 📖 查看相应方式的详细指南
- 📋 查看 [SUBMODULE_INTEGRATION_CHECKLIST.md](./SUBMODULE_INTEGRATION_CHECKLIST.md) 的问题排查
- 🐛 提交 issue（包含你使用的方式）

---

## 🎓 总结

| 选择 | 为什么 |
|------|--------|
| **NPM（方式 1）** | 最简单、官方维护、推荐生产 |
| **Submodule + 编译（方式 2）** | 贡献者首选、最稳定 |
| **Submodule + 源码（方式 3）** | 快速开发首选、快速迭代 |

无论选择哪种方式，**test 和 examples 都被完全隐藏**，你的代码始终保持清洁！

