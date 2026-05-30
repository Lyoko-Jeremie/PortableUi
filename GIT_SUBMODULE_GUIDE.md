# Git Submodule 使用指南

当通过 git submodule 的方式引用 PortableUi 库时，你会获得完整的仓库代码，包括 `test`、`examples` 等目录。本指南说明如何正确使用该库，及如何避免在编译时引入测试和示例代码。

## 前置要求

确保已在主项目中运行库的构建命令：

```bash
cd path/to/submodule/PortableUi
yarn install
yarn build
```

这会生成 `dist/` 目录，其中包含库产物和类型声明文件。

## TypeScript 配置

### 方案 1: 自动类型解析（推荐）

库的 `package.json` 已配置 `typesVersions` 和 `exports` 字段，TypeScript 会**自动**将所有导入解析到 `dist/` 目录中的类型声明。

在主项目的 `tsconfig.json` 中，仅需确保 paths 映射指向 submodule 目录即可：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./path/to/submodule/PortableUi"]
    }
  }
}
```

然后在代码中正常导入：

```typescript
import { Button, Input } from 'PortableUi';
```

TypeScript 会自动解析到 `dist/index.d.ts`，而不会触及 `test` 或 `examples`。

### 方案 2: 显式配置（备选）

如果方案 1 不生效，显式指向 `dist` 目录：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./path/to/submodule/PortableUi/dist"]
    }
  }
}
```

## 编译时隔离机制

该库采用多层隔离策略确保使用者不会意外引入 test/examples：

| 机制 | 说明 |
|------|------|
| **TypeScript config** | 基础 `tsconfig.json` 仅包含 `src/**/*`；专用 `tsconfig.build.json` 用于库构建 |
| **package.json exports** | 定义了单一导出点 `.`，指向 `dist/index.d.ts` 和 `dist/index.js` |
| **typesVersions** | 所有版本的类型查询都被映射到 `dist/*` 目录 |
| **files 字段** | npm 发布时仅包含 `dist` 目录 |

## 验证编译输出

检查编译后的代码是否正确排除了 test/examples：

```bash
# 在主项目中构建
tsc

# 检查生成的声明文件是否包含 test 或 examples
find dist -name "*.d.ts" | xargs grep -l "test\|examples"
# 应返回为空，表示没有引入测试或示例代码
```

## 避免常见问题

### ❌ 错误：直接导入 src 目录

```typescript
// ❌ 不要这样做
import { Button } from 'PortableUi/src/components/basic';
```

### ✅ 正确：使用包导出

```typescript
// ✅ 只通过包主入口导入
import { Button } from 'PortableUi';
```

### ❌ 错误：在 typeRoot 中包含整个仓库

```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./submodule"]  // ❌ 不要
  }
}
```

### ✅ 正确：让 TypeScript 自动解析

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./path/to/submodule"]
    }
  }
}
```

## 更新库版本

当更新 submodule 后，重新构建库：

```bash
cd path/to/submodule/PortableUi
git pull
yarn install
yarn build
```

确保 `dist` 目录已更新为最新代码。

## 问题排查

如果编译时仍然看到 test 或 examples 的类型：

1. **清除 TypeScript 缓存**
   ```bash
   rm -rf node_modules/.cache
   rm -f *.tsbuildinfo
   ```

2. **重新构建库**
   ```bash
   cd path/to/submodule/PortableUi
   rm -rf dist
   yarn build
   ```

3. **验证 package.json 配置**
   确保库的 `exports` 和 `typesVersions` 字段未被修改

4. **检查 baseUrl 和 paths**
   如果使用了 paths 映射，确保正确指向 submodule 目录

## 进一步阅读

- [TypeScript: Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [npm: exports](https://nodejs.org/api/packages.html#packages_exports)
- [TypeScript: Typings Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

