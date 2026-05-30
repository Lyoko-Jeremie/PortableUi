# 直接源码使用指南（不编译 dist）

当你使用 git submodule 的方式引入 PortableUi，且希望**不构建 `dist/` 目录而是直接使用源代码**时，本指南适用。

这种使用方式适合：
- 开发环境，想快速测试库的变更
- 构建流程完整的项目，能够直接处理 TypeScript 源文件
- CI/CD 流程中，不希望添加额外的库构建步骤

## 🚀 快速开始

### 方式 B：直接源码使用（不需要 yarn build）

#### 1. 添加 Submodule

```bash
git submodule add <repo-url> submodules/PortableUi
# 注意：无需进入 submodule 目录执行 yarn build
```

#### 2. 配置项目的 tsconfig.json

关键是通过 `paths` 映射指向 `src/` 目录：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "lib": ["ES2020", "DOM"],
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./submodules/PortableUi/src"],
      "PortableUi/*": ["./submodules/PortableUi/src/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"]
}
```

**关键配置说明：**
- `baseUrl`: 设置为项目根目录
- `paths` - 第一条：主包导入 → 指向 `src` 目录（而非 `dist`）
- `paths` - 第二条：子路径导入 → 也指向 `src` 目录
- 不需要为 PortableUi 额外修改你项目自己的 `exclude`，只要 `paths` 不指向 submodule 根目录即可

#### 3. 在代码中导入

```typescript
// src/index.ts 或其他文件
import { Button, Input, Select } from 'PortableUi';
import { createLayout } from 'PortableUi/layout';

const button = new Button({
  label: 'Click me',
  onClick: () => console.log('Clicked!')
});
```

#### 4. 编译和打包

使用你项目的构建工具（webpack、vite、parcel 等）进行编译：

```bash
# 如果使用 webpack + ts-loader
webpack

# 如果使用 vite
vite build

# 或直接使用 tsc
tsc
```

你的构建工具会自动：
1. 编译 PortableUi 的源代码（via ts-loader / esbuild / babel）
2. 生成对应的编译产物（JavaScript + 可选的 source maps）
3. 进行 tree-shaking 和代码优化

## 📊 两种使用方式对比

| 方面 | 方式 A（推荐）| 方式 B（直接源码） |
|------|-------------|--------------|
| **是否需要 yarn build** | ✅ 需要 | ❌ 不需要 |
| **输入文件** | `dist/`（已编译） | `src/`（TypeScript） |
| **编译责任** | 库内配置 | 使用者工具 |
| **开发速度** | 快（预编译） | 取决于编译工具 |
| **打包体积** | 需要 tree-shake | 工具自动优化 |
| **类型检查** | 预定义 | 实时检查 |
| **调试友好性** | 需要 source maps | 原始 TypeScript |
| **适用场景** | 生产、npm 发布 | 开发、CI/CD |

## ⚙️ 构建工具配置示例

### Webpack + ts-loader

```javascript
// webpack.config.js
module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    tsconfig: './tsconfig.json'  // 会自动应用 paths 配置
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

### Vite

Vite 会自动读取 `tsconfig.json` 中的 `paths` 配置，无需额外设置。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // 如适用

export default defineConfig({
  plugins: [vue()],
  // paths 配置从 tsconfig.json 自动读取
  resolve: {
    alias: {
      // tsconfig 的 paths 会自动应用
    }
  }
});
```

### TypeScript 直接编译

```bash
tsc --project ./tsconfig.json
```

## 🔍 类型解析流程

在直接源码使用模式下，TypeScript 的解析流程如下：

```
你的代码
  ↓
import { Button } from 'PortableUi'
  ↓
TypeScript 查找 tsconfig.json 的 paths
  ↓
发现 "PortableUi": ["./submodules/PortableUi/src"]
  ↓
解析到 submodules/PortableUi/src/index.ts
  ↓
读取源文件的类型定义（✓ 不涉及 test/examples）
  ↓
获取完整的类型信息
```

## ⚠️ 隔离机制：test/examples 仍被排除

即使直接使用源代码，以下机制仍然确保你不会意外引入 test 或 examples：

### 1. **package.json 的 typesVersions**
```json
{
  "typesVersions": { "*": { "*": ["dist/*"] } }
}
```
- 如果你按照** paths 配置**正确指向 `src/`，则会使用源文件
- 如果你不配置 paths，则自动回退到 `dist/`

### 2. **tsconfig.json 的 include/exclude**
```json
{
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```
- 库的基础配置仅包含 `src` 目录
- test 和 examples 完全不在编译范围内

### 3. **src/index.ts 的导出**
```typescript
export * from './core';
export * from './components/basic';
export * from './components/complex';
// ... 其他导出
// 完全不导出 test 或 examples 中的任何内容
```

## ❌ 避免常见错误

### ❌ 错误 1：直接导入 test/examples

```typescript
// 错误：即使文件存在，也不应这样做
import { TestSuite } from 'PortableUi/test';
import { exampleCode } from 'PortableUi/examples/basic';
```

### ✅ 正确：仅通过主导出

```typescript
// 正确：所有导入通过公共 API
import { Button, Input } from 'PortableUi';
```

### ❌ 错误 2：paths 配置不正确

```json
{
  "paths": {
    // 错误：指向了项目根目录（会把 test/examples 也纳入解析范围）
    "PortableUi": ["./submodules/PortableUi"],
    "PortableUi/*": ["./submodules/PortableUi/*"]
  }
}
```

### ✅ 正确：显式指向 src

```json
{
  "paths": {
    // 正确：明确指向 src 目录
    "PortableUi": ["./submodules/PortableUi/src"]  // ✅
  }
}
```

### ❌ 错误 3：混合使用编译版和源代码

```typescript
// 错误：某些位置使用 dist，某些位置使用 src
import A from 'PortableUi/dist/index';      // ❌
import B from 'PortableUi/src/index';       // ❌
import C from 'PortableUi';                 // ✅
```

### ✅ 正确：统一使用包导出

```typescript
// 正确：始终通过包主入口
import { A, B, C } from 'PortableUi';  // ✅
```

## 📋 检查清单

- [ ] Submodule 已添加：`git submodule add ... submodules/PortableUi`
- [ ] tsconfig.json 中配置了 `paths`，指向 `src` 目录
- [ ] `baseUrl` 设置为项目根目录
- [ ] 导入时使用 `import { X } from 'PortableUi'`（不使用相对路径）
- [ ] 构建工具能够处理 TypeScript（ts-loader、esbuild 等）
- [ ] 运行构建命令后成功编译
- [ ] IDE 能够识别从 PortableUi 导入的类型

## 🔧 问题排查

### 问题 1：找不到模块 'PortableUi'

**原因**：tsconfig.json 的 paths 配置不正确或 baseUrl 未设置

**解决方案**：
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./submodules/PortableUi/src"]
    }
  }
}
```

### 问题 2：IDE 没有代码补全

**原因**：IDE 没有识别到 tsconfig.json 的配置

**解决方案**：
- 重启 IDE 或 TypeScript 服务
- 检查 tsconfig.json 文件是否有语法错误
- 确保 baseUrl 和 paths 配置正确

### 问题 3：编译错误或类型不匹配

**原因**：库的源代码依赖可能与你的项目配置不兼容

**解决方案**：
- 确保 TypeScript 版本不要过旧（推荐 4.5+）
- 检查 tsconfig.json 的 `lib` 和 `target` 配置
- 如果问题持续，切换回方式 A（使用预编译的 dist）

### 问题 4：打包体积过大

**原因**：构建工具没有进行有效的 tree-shaking

**解决方案**：
- 使用支持 ES modules 的构建工具（webpack 5、vite 等）
- 确认您的代码是否存在不必要的导入
- 考虑切换回方式 A 使用预编译版本

## 📚 方式 A vs 方式 B 决策树

```
你计划使用 git submodule 引入 PortableUi
         ↓
   是否需要快速开发和测试？
    ↙              ↘
   YES             NO
    ↓               ↓
 方式 B       需要生产环境？
 (源码)        ↙       ↘
              YES       NO
              ↓         ↓
            方式 A    选择两者之一
            (dist)   （根据项目需求）
```

**选择方式 A 的原因**：
- ✅ 需要生产发布
- ✅ 希望依赖预编译的稳定版本
- ✅ 想要最好的打包体积优化
- ✅ 团队规模较大，需要标准化

**选择方式 B 的原因**：
- ✅ 快速开发和实验
- ✅ 需要调试库的源代码
- ✅ 项目构建流程已完整
- ✅ 想要最小的集成步骤

## 🔗 相关文档

- `GIT_SUBMODULE_GUIDE.md` - 完整的 git submodule 使用指南
- `examples/SUBMODULE_USAGE.md` - 方式 A 的详细使用示例
- `SUBMODULE_SOLUTION_SUMMARY.md` - 解决方案总结

## 📖 进一步阅读

- [TypeScript: Path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Webpack: ts-loader](https://github.com/TypeStrong/ts-loader)
- [Vite: Aliases](https://vitejs.dev/config/shared-options.html#resolve-alias)
- [Parcel: TypeScript](https://parceljs.org/languages/typescript/)

