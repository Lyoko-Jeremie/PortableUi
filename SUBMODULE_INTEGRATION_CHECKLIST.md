# Git Submodule 集成清单

本清单说明已为 git submodule 场景采取的措施，以及如何验证它们的有效性。

## ✅ 已实施的优化

### 1. **包导出隔离 (package.json)**
- ✅ `main`: 指向 `dist/index.js`
- ✅ `types`: 指向 `dist/index.d.ts`
- ✅ `exports`: 单一导出点，只暴露库的公共 API
- ✅ `typesVersions`: 强制所有类型查询指向 `dist/` 目录
- ✅ `files`: 使用白名单，npm 发布时仅包含 `dist`

### 2. **构建隔离 (tsconfig.json / tsconfig.build.json)**
- ✅ 基础 `tsconfig.json`: `include: ["src/**/*"]`（排除 test/examples）
- ✅ 专用 `tsconfig.build.json`: 
  - 只编译 `src` 目录
  - 显式排除 `examples` 和 `test`
  - 指定 `dist` 为输出目录

### 3. **NPM 发布隔离 (.npmignore)**
- ✅ 忽略 `test/`, `examples/`, `*.md`, 配置文件等
- ✅ 仅保留 `dist/` 目录（通过 `files` 字段）

### 4. **文档和指南**
- ✅ `GIT_SUBMODULE_GUIDE.md`: Git submodule 用户的详细指南
- ✅ `examples/SUBMODULE_USAGE.md`: 完整的使用示例
- ✅ `examples/tsconfig.submodule.example.json`: 参考配置文件

## 🔍 验证方法

### 验证 1: 检查编译产物

```bash
# 清理并重新构建
rm -rf dist
yarn build

# 检查 dist 顶层目录
ls -la dist/

# 预期输出应仅包含：
# adaptor/
# components/
# core/
# i18n/
# layout/
# styles/
# types/
# utils/
# index.d.ts
# index.d.ts.map
# index.js
# index.js.map

# 验证不包含 test 或 examples
find dist -type f -name "*.ts" -o -name "*.js" | grep -E "(test|examples)"
# 应输出为空
```

### 验证 2: 检查类型声明入口

```bash
# 确保 package.json 中的类型指向正确
cat package.json | grep -A 2 "types\|exports\|typesVersions"

# 预期输出：
# "types": "dist/index.d.ts",
# "exports": { ".": { "types": "./dist/index.d.ts", ... } }
# "typesVersions": { "*": { "*": ["dist/*"] } }
```

### 验证 3: 模拟 Git Submodule 使用

创建一个测试项目来验证 submodule 场景：

```bash
# 创建临时测试目录
mkdir /tmp/test-submodule
cd /tmp/test-submodule
git init

# 添加 PortableUi 作为 submodule
git submodule add ../PortableUi submodules/PortableUi
cd submodules/PortableUi
yarn install && yarn build
cd ../..

# 创建测试应用
mkdir src
cat > src/test.ts << 'EOF'
import { Button, Input } from 'PortableUi';
// 尝试错误导入（应该失败）
// import { TestSuite } from 'PortableUi/test';
EOF

# 配置 TypeScript
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./submodules/PortableUi"],
      "PortableUi/*": ["./submodules/PortableUi/dist/*"]
    },
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
EOF

# 运行 TypeScript 编译器
npx tsc

# 检查编译是否成功
test -f dist/test.js && echo "✓ Compilation successful" || echo "✗ Compilation failed"
```

### 验证 4: 检查 npm 发布清单

```bash
# 查看 npm 会发布哪些文件
npm pack --dry-run

# 或使用：
yarn pack --dry-run

# 预期：仅包含 dist/ 目录及根目录的必要文件
# 不应包含 test/, examples/, *.md（除了 README.md）等
```

## 🚀 Git Submodule 用户的快速检查表

使用 submodule 的项目应验证以下项：

- [ ] 已在 submodule 目录中运行 `yarn install && yarn build`
- [ ] 主项目 `tsconfig.json` 中有 `paths` 配置指向 submodule
- [ ] 代码只通过 `import { X } from 'PortableUi'` 导入，不使用内部路径
- [ ] 运行 `tsc` 后能成功编译，无类型错误
- [ ] 编译输出中不包含 test 或 examples 代码

## 📋 库维护者的检查表

- [ ] 确保 `tsconfig.json` 的 `include` 不包含 `test` 或 `examples`
- [ ] 使用 `tsconfig.build.json` 进行库的发布构建
- [ ] 验证每次发布前 `package.json` 中的 `exports` 和 `typesVersions` 配置未变
- [ ] 定期验证 `.npmignore` 和 `files` 字段的配置
- [ ] 测试 git submodule 场景（可通过上述"验证 3"进行）

## 🔗 关键配置文件位置

| 文件 | 用途 |
|------|------|
| `package.json` | 定义包的导出、类型入口和 npm 发布规则 |
| `tsconfig.json` | 基础编译配置（仅 src） |
| `tsconfig.build.json` | 发布构建配置（明确排除 test/examples） |
| `.npmignore` | npm 发布时的忽略规则 |
| `GIT_SUBMODULE_GUIDE.md` | Submodule 用户指南 |
| `examples/SUBMODULE_USAGE.md` | 完整使用示例 |
| `examples/tsconfig.submodule.example.json` | 用户项目配置示例 |

## 💡 原理总结

**多层防御机制**确保 git submodule 用户不会意外引入 test/examples：

1. **类型解析层**（`typesVersions` + `exports`）
   - TypeScript 自动解析到 `dist/` 中的声明文件

2. **编译隔离层**（`tsconfig.build.json`）
   - 库仅编译 `src/`，不编译 test/examples

3. **发布白名单层**（`files` + `.npmignore`）
   - npm 包仅包含 `dist/`，保护 npm 用户

4. **文档指导层**（本指南）
   - 明确说明 git submodule 用户应如何配置和使用

即使项目完整克隆仓库（git submodule），TypeScript 的类型系统也会自动引导到已编译的、经过隔离的 `dist/` 目录，从而实现编译时的隔离。

