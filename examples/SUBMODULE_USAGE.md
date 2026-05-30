# Git Submodule 使用示例

本目录中的 `tsconfig.submodule.example.json` 是一个参考配置，展示如何在使用 PortableUi 作为 git submodule 时正确配置 TypeScript。

## 完整使用示例

假设你的项目目录结构如下：

```
my-app/
├── src/
│   └── index.ts
├── submodules/
│   └── PortableUi/          ← git submodule
├── tsconfig.json
├── package.json
└── ...
```

### 1. 添加 Submodule

```bash
git submodule add <PortableUi-repo-url> submodules/PortableUi
cd submodules/PortableUi
yarn install
yarn build  # 重要：构建库以生成 dist/
```

### 2. 配置主项目的 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "baseUrl": ".",
    "paths": {
      "PortableUi": ["./submodules/PortableUi"],
      "PortableUi/*": ["./submodules/PortableUi/dist/*"]
    },
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

**关键配置说明：**
- `baseUrl` + `paths`：告诉 TypeScript 如何解析 `PortableUi` 的导入
- 第一个 `paths` 条目：处理从包主入口的导入（如 `import { Button } from 'PortableUi'`）
- 第二个 `paths` 条目：处理从子路径的导入（如 `import { Button } from 'PortableUi/components'`）

### 3. 在代码中使用

```typescript
// src/index.ts
import { Button, Input, Select } from 'PortableUi';
import { createLayout } from 'PortableUi/layout';

const app = document.getElementById('app')!;

const button = new Button({
  label: 'Click me',
  onClick: () => console.log('Clicked!')
});

button.render(app);
```

### 4. 编译验证

```bash
tsc

# 检查生成的代码是否正确
ls -la dist/

# 验证不包含 test 或 examples 代码
find dist -name "*.d.ts" -exec grep -l "test\|examples" {} \;
# 应输出为空
```

## 类型解析机制

当你在代码中写 `import { Button } from 'PortableUi'` 时，TypeScript 的解析流程如下：

```
1. 查找 submodules/PortableUi/package.json
   ↓
2. 读取 "types": "dist/index.d.ts"
   ↓
3. 读取 "typesVersions": { "*": { "*": ["dist/*"] } }
   ↓
4. 解析到 submodules/PortableUi/dist/index.d.ts
   ↓
5. 获取类型信息（不涉及 src/, test/, examples/ 目录）
```

即使整个仓库都被检出，TypeScript 也会自动引导到 `dist/` 目录中的编译后的声明文件。

## 更新 Submodule

当需要更新库版本时：

```bash
cd submodules/PortableUi
git pull origin main  # 或你的分支
yarn install
yarn build

# 回到主项目
cd ../..
git add submodules/PortableUi
git commit -m "Update PortableUi"
```

## 常见问题

### Q: 为什么要在 submodule 中运行 `yarn build`？
A: 因为 npm/yarn 或打包工具需要 `dist/` 目录中的编译产物，否则会解析到 TypeScript 源文件。

### Q: 可以让 IDE 显示正确的代码补全吗？
A: 可以。大多数现代 IDE（VS Code、WebStorm）会自动识别 `tsconfig.json` 中的 `paths` 配置，提供正确的代码补全。

### Q: `skipLibCheck: true` 有什么作用？
A: 它加快类型检查速度，跳过对依赖库的类型检查。对于使用 git submodule 的场景，建议启用以避免重复检查。

## 发布/打包

如果你要打包自己的应用：

```bash
# 如果使用 webpack 等打包工具，确保它也能正确解析 PortableUi
# 大多数现代打包工具都支持 package.json 的 exports 字段自动解析
webpack
```

## 进一步阅读

- [TypeScript: Path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [npm: typesVersions](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#typesversions)
- [Git Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

