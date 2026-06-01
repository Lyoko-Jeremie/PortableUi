# ObjectKeyBinding IDE 提示与类型约束指南

## 概述

PortableUi 的 `ObjectKeyBinding` 现已支持完整的 IDE 代码补全和类型检查，利用 TypeScript 的高级类型推导能力。

**核心特性：**

- 点分隔路径的自动补全（如 `profile.name`、`settings.theme`）
- 编译时类型检查（拼写错误会被捕获）
- 深层对象结构的完整支持
- 无运行时开销

---

## 工作原理

### ObjectKeyPathOf<T> 类型

```typescript
export type ObjectKeyPathOf<T extends Record<string, any>> = /* ... */;
```

这个类型会递归遍历对象 `T` 的所有属性，生成所有可能的完整点分隔路径。

**示例：**

```typescript
interface User {
  id: number;
  profile: {
    name: string;
    email: string;
    contacts: {
      phone: string;
    };
  };
}

type UserPaths = ObjectKeyPathOf<User>;

// UserPaths 等价于：
// 'id' | 'profile' | 'profile.name' | 'profile.email' | 
// 'profile.contacts' | 'profile.contacts.phone'
```

### ObjectKeyBinding 泛型约束

```typescript
interface ObjectKeyBinding<
  TTarget extends Record<string, any>,
  TValue = any,
  TKey extends string = ObjectKeyPathOf<TTarget>,
> {
  target: TTarget;
  key: TKey; // IDE 会根据 target 类型推导 key 的有效值
  // ...
}
```

---

## 使用方法

### 1. 直接在绑定中获得 IDE 提示

```typescript
const user = {
  profile: {
    name: 'Alice',
    email: 'alice@example.com',
  },
};

app.addInput({
  id: 'name',
  bind: {
    value: {
      target: user,
      key: 'profile.name', // ✅ IDE 会补全 profile.name
      //      ^
      // 按 Ctrl+Space 可以看到代码补全列表：
      // - profile
      // - profile.name
      // - profile.email
    },
  },
});
```

### 2. 在 markDirty() 中获得 IDE 提示

```typescript
app.markDirty(user, 'profile.email'); // ✅ IDE 会推导 key 的有效值
//                     ^
// 编译时会检查：
// - 路径是否有效
// - 不会接受无效的拼写如 'profle.email'
```

### 3. 编译时类型检查

```typescript
// ✅ 正确用法
app.markDirty(user, 'profile.name');

// ❌ 错误会被编译器捕获
app.markDirty(user, 'invalid.path'); // TS Error: Type '"invalid.path"' is not assignable to...
app.markDirty(user, 'profle.name'); // TS Error: 拼写错误
```

---

## 高级场景

### 场景1：类型安全的多对象绑定

```typescript
interface UserData {
  name: string;
  email: string;
}

interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
}

const userData: UserData = {name: 'Bob', email: 'bob@example.com'};
const appSettings: AppSettings = {theme: 'light', notifications: true};

// 为每个对象创建专属的绑定，IDE 会分别提示
app.addInput({
  id: 'username',
  bind: {
    value: {
      target: userData,
      key: 'name', // IDE: name | email
    },
  },
});

app.addSelect({
  id: 'theme',
  bind: {
    value: {
      target: appSettings,
      key: 'theme', // IDE: theme | notifications
    },
  },
});

// markDirty 时，约束也会分别应用
app.markDirty(userData, 'email'); // ✅ 针对 UserData
app.markDirty(appSettings, 'theme'); // ✅ 针对 AppSettings
app.markDirty(userData, 'theme'); // ❌ Error: theme 不在 UserData 中
```

### 场景2：深层对象结构

```typescript
interface Config {
  database: {
    connection: {
      host: string;
      port: number;
      credentials: {
        username: string;
        password: string;
      };
    };
  };
}

const config: Config = { /* ... */ };

// IDE 会支持深层路径补全
app.markDirty(config, 'database'); // ✅
app.markDirty(config, 'database.connection'); // ✅
app.markDirty(config, 'database.connection.host'); // ✅
app.markDirty(config, 'database.connection.credentials.username'); // ✅

// 拼写错误会被捕获
app.markDirty(config, 'database.connection.credentails.username'); // ❌ 拼写错误
```

### 场景3：动态创建响应式组件

```typescript
function createUserFormField<T extends Record<string, any>>(
  data: T,
  fieldKey: ObjectKeyPathOf<T>,
  fieldType: 'input' | 'checkbox',
): void {
  if (fieldType === 'input') {
    app.addInput({
      id: `field-${fieldKey}`,
      bind: {
        value: {
          target: data,
          key: fieldKey, // ✅ fieldKey 类型自动约束为有效路径
        },
      },
    });
  }
}

// 使用时，IDE 会提示有效的字段
createUserFormField(userData, 'name', 'input'); // ✅
createUserFormField(userData, 'invalid', 'input'); // ❌ Error
```

---

## IDE 支持情况

### Visual Studio Code

| 功能 | 支持 | 说明 |
|---|---|---|
| 代码补全 | ✅ | 按 `Ctrl+Space` 显示有效路径列表 |
| 类型提示 | ✅ | 悬停显示路径对应的值类型 |
| 错误检查 | ✅ | 红色波浪线显示无效路径 |
| 快速修复 | ⚠️ | 部分 IDE 无法自动修复 |

### WebStorm / IntelliJ IDEA

| 功能 | 支持 | 说明 |
|---|---|---|
| 代码补全 | ✅ | 智能补全所有有效路径 |
| 类型提示 | ✅ | 显示完整的类型信息 |
| 错误检查 | ✅ | 即时报告类型错误 |
| 导航 | ✅ | `Ctrl+Click` 跳转到定义 |

---

## 常见问题

### Q1: 为什么我没有看到 IDE 提示？

**原因：**
1. IDE 的 TypeScript 服务可能未启用
2. 项目的 `tsconfig.json` 配置有问题
3. 需要更新 TypeScript 版本

**解决：**
```bash
# 确保 TypeScript 版本足够新
npm install -D typescript@latest

# 在 VSCode 中重启 TypeScript 服务
Ctrl+Shift+P -> TypeScript: Restart TS Server
```

### Q2: 深层路径很长，IDE 补全太多了？

**建议：**
1. 输入几个字符后按 `Ctrl+Space` 进行模糊过滤
2. 或者声明中间类型以简化路径：

```typescript
type userProfilePath = ObjectKeyPathOf<User['profile']>;

// 然后在 bind 中
bind: {
  value: {
    target: user.profile, // 注意这里用的是 user.profile
    key: 'name', // 路径相对于 profile，所以更短
  },
}
```

### Q3: 动态构造 key 时无法获得提示？

**问题代码：**
```typescript
const field = getUserField(); // 返回 string
app.markDirty(user, field); // IDE 无法推导 field 的有效值
```

**解决方案：**
```typescript
// 方案1：使用类型守卫
function markUserDirty(field: ObjectKeyPathOf<User>): void {
  app.markDirty(user, field);
}

// 方案2：保持动态，放弃 IDE 提示
const field: string = getUserField();
app.markDirty(user, field as ObjectKeyPathOf<User>); // any 类型，不安全
```

### Q4: 如何为自定义类型启用 IDE 提示？

**直接使用：**
```typescript
interface MyData {
  name: string;
  nested: {
    value: number;
  };
}

type MyDataPaths = ObjectKeyPathOf<MyData>;

// 然后在 bind 中使用
bind: {
  value: {
    target: myData,
    key: 'nested.value' as MyDataPaths, // 手动类型标注
  },
}
```

---

## 最佳实践

### 1. 为复杂对象类型定义接口

```typescript
// ✅ 好的做法
interface UserProfile {
  id: number;
  personal: {
    firstName: string;
    lastName: string;
  };
}

const user: UserProfile = { /* ... */ };
app.markDirty(user, 'personal.firstName');

// ❌ 避免
const user = {id: 1, personal: {firstName: ''}};
app.markDirty(user, 'personal.firstName'); // IDE 可能无法推导
```

### 2. 使用类型推导而不是手动注解

```typescript
// ✅ IDE 会自动推导
const binding: ObjectKeyBinding<typeof user> = {
  target: user,
  key: 'profile.name', // 自动推导
};

// ❌ 避免手动指定
const binding: ObjectKeyBinding<any> = {
  target: user,
  key: 'anything', // 失去类型检查
};
```

### 3. 为回调提供类型上下文

```typescript
// ✅ 在回调外部声明 target 已知
const user: User = { /* ... */ };

app.addButton({
  bind: {
    onClick: (ctx) => {
      // ctx.touch() 仍是通用的，但我们知道绑定的对象
      user.profile.name = 'Bob';
      ctx.touch('profile.name'); // IDE 无法这里检查，但逻辑清晰
    },
  },
});
```

### 4. 为大型应用创建路径常数

```typescript
// constants.ts
export const USER_PATHS = {
  NAME: 'profile.name' as const,
  EMAIL: 'profile.email' as const,
  PHONE: 'profile.contacts.phone' as const,
} as const;

// 使用
app.addInput({
  bind: {
    value: {
      target: user,
      key: USER_PATHS.NAME, // ✅ 类型安全且可重用
    },
  },
});

app.markDirty(user, USER_PATHS.EMAIL);
```

---

## 性能考量

ObjectKeyPathOf 类型推导是编译时操作，**无运行时开销**。

- ✅ 不会增加打包体积
- ✅ 不会影响运行性能
- ⚠️ 可能增加 IDE 的类型检查时间（对于极深的对象结构）

如果遇到 IDE 卡顿，可以考虑分割对象类型或使用中间类型。

---

## 总结

| 功能 | 支持 | 使用场景 |
|---|---|---|
| 代码补全 | ✅ | 日常编码，快速输入路径 |
| 类型检查 | ✅ | 编译时捕获拼写错误 |
| 类型推导 | ✅ | 自动从对象类型推导路径 |
| 深层路径 | ✅ | 任意嵌套深度 |
| 动态构造 | ⚠️ | 需要手动类型标注 |

建议在所有生产应用中启用 TypeScript 严格模式，充分利用这些类型检查能力。

