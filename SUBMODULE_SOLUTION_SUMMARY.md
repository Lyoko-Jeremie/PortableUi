# Git Submodule 场景的完整解决方案

## 📋 问题

当库的使用者以 git submodule 的方式使用当前库时，他们会获得整个仓库，包括 `test`、`examples` 等目录。这可能导致：

1. **类型污染**：TypeScript 可能错误地导入 test 或 examples 中的类型
2. **代码膨胀**：打包工具可能不小心包含测试和示例代码
3. **依赖污染**：test 中的依赖可能与库的实际依赖冲突

## ✅ 解决方案概览

通过实施 **多层隔离机制**，确保即使在 git submodule 场景下，使用者也能被正确地引导到已编译、经过隔离的库代码。

```
使用者的 TypeScript 编译器
    ↓
读取 package.json 中的 "types" 和 "exports" 字段
    ↓
发现 "typesVersions": { "*": { "*": ["dist/*"] } }
    ↓
自动解析到 dist/index.d.ts（已编译的声明文件）
    ↓
不涉及 src/、test/、examples/ 目录
```

## 🛠 已实施的改动

### 1. **package.json - 包导出配置**

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "typesVersions": {
    "*": {
      "*": ["dist/*"]
    }
  },
  "files": ["dist"]
}
```

**作用：**
- 定义包的主入口点
- 为所有 TypeScript 版本强制使用 dist 目录中的类型声明
- npm 发布时仅包含 dist 目录

### 2. **tsconfig.json - 基础编译配置**

```json
{
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

**改动：**- 移除了 `"examples/**/*"` 和 `"test/**/*"` 从 include 列表
- 这确保主编译配置不会无意中包含这些目录

### 3. **tsconfig.build.json - 专用发布构建配置**（新增）

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "examples", "test"]
}
```

**作用：**
- 专门用于库的发布构建
- 明确且显式地排除 test 和 examples
- 定义清晰的输入（src）和输出（dist）目录

### 4. **.npmignore 文件**（新增）

```
test/
examples/
*.md
tsconfig*.json
jest.config.js
jest.setup.js
webpack.examples.config.js
coverage/
docs/
.idea/
.vscode/
...
```

**作用：**
- npm 发布时的黑名单
- 虽然 `files` 字段是白名单，但 `.npmignore` 提供了额外的文档说明

### 5. **package.json - 新增 build 脚本**

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "prepublishOnly": "yarn build"
  }
}
```

**作用：**
- 使用专用的构建配置
- 发布前自动构建，确保 dist 目录是最新的

### 6. **文档指南**（新增）

创建了三份文档：

| 文档 | 对象 | 内容 |
|------|------|------|
| `GIT_SUBMODULE_GUIDE.md` | Git submodule 用户 | 详细的使用指南和最佳实践 |
| `examples/SUBMODULE_USAGE.md` | Git submodule 用户 | 完整的使用示例和故障排查 |
| `SUBMODULE_INTEGRATION_CHECKLIST.md` | 库维护者 | 验证清单和实现细节 |

## 🔍 工作原理

### TypeScript 类型解析流程

1. **用户导入包**
   ```typescript
   import { Button } from 'PortableUi';
   ```

2. **TypeScript 查找声明文件**
   - 首先检查 `node_modules/PortableUi/package.json` 的 `types` 字段
   - 或查看 `exports` 字段中是否定义了 `types`

3. **利用 typesVersions**
   - TypeScript 读取 `typesVersions`: `{ "*": { "*": ["dist/*"] } }`
   - 这告诉 TypeScript：对于所有导入，都映射到 `dist/` 目录

4. **解析到编译产物**
   - 最终解析到 `dist/index.d.ts`（已编译的声明文件）
   - 不涉及 src/, test/, examples/ 目录

### 即使在 Git Submodule 场景

当用户通过 git submodule 检出整个仓库时：

```
项目结构：
my-app/
├── submodules/PortableUi/
│   ├── src/              ← 原始源文件
│   ├── test/             ← 测试文件（被隐藏）
│   ├── examples/         ← 示例文件（被隐藏）
│   ├── dist/             ← ✓ 编译后的代码（使用这个）
│   ├── package.json      ← 定义类型入口指向 dist/
│   └── tsconfig.json     ← 仅编译 src/
└── tsconfig.json         ← paths 映射指向 submodule
```

TypeScript 仍然会：
1. 读取 package.json 中的 `typesVersions` 配置
2. 自动将所有导入映射到 `dist/` 目录
3. 即使整个仓库都存在，也只使用编译后的产物

## 📦 NPM 发布的隔离

虽然 git submodule 不直接受 npm 发布规则影响，但这些规则确保了：

1. **用户通过 npm 安装时**：仅获得 `dist/` 目录
2. **源代码仓库与发布物严格分离**
3. **包体积最小化**

## ✅ 验证清单

- ✅ `dist` 目录不包含 test 或 examples 文件
- ✅ `package.json` 定义了 `typesVersions` 映射
- ✅ `tsconfig.build.json` 显式排除 test 和 examples
- ✅ 编译脚本使用 `tsconfig.build.json`
- ✅ 已创建 git submodule 使用指南

## 🚀 使用者快速开始

### NPM 安装用户

```bash
npm install PortableUi
```

自动获得 `dist/` 中的编译产物，完全隔离。

### Git Submodule 用户

参考 `GIT_SUBMODULE_GUIDE.md`：

```bash
git submodule add <repo-url> submodules/PortableUi
cd submodules/PortableUi && yarn install && yarn build
cd ../..

# 在 tsconfig.json 中配置
{
  "paths": {
    "PortableUi": ["./submodules/PortableUi"]
  }
}
```

TypeScript 自动处理类型解析。

## 📚 参考文档

- `GIT_SUBMODULE_GUIDE.md` - Submodule 用户完整指南
- `examples/SUBMODULE_USAGE.md` - 使用示例和故障排查
- `examples/tsconfig.submodule.example.json` - 参考配置
- `SUBMODULE_INTEGRATION_CHECKLIST.md` - 验证清单

## 🔗 相关标准

- [TypeScript: Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Node.js: Package Exports](https://nodejs.org/api/packages.html#packages_exports)
- [TypeScript: typesVersions](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#typesversions)

