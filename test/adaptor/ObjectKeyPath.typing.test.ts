import {App} from '../../src/adaptor/App';
import type {ObjectKeyBinding, ObjectKeyPathOf} from '../../src/adaptor/types';

// ============================================================================
// 类型测试：验证 ObjectKeyPathOf 和 markDirty 的 IDE 提示能力
// ============================================================================

// 定义测试数据类型
interface User {
  id: number;
  profile: {
    name: string;
    email: string;
    contacts: {
      phone: string;
      address: string;
    };
  };
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// 测试 1: ObjectKeyPathOf 类型推导
type UserPaths = ObjectKeyPathOf<User>;
// 期望的精确类型（为 IDE 提示）：
// 'id' | 'profile' | 'profile.name' | 'profile.email' | 'profile.contacts' |
// 'profile.contacts.phone' | 'profile.contacts.address' | 'settings' | 'settings.theme' | 'settings.notifications'

const userPathsTest: UserPaths = 'profile.name'; // ✅ 通过
const userPathsTest2: UserPaths = 'profile.contacts.phone'; // ✅ 通过
const userPathsTest3: UserPaths = 'settings.theme'; // ✅ 通过

// @ts-expect-error 错误路径应该报错
const userPathsTestInvalid: UserPaths = 'invalid.path.here';

// @ts-expect-error 拼写错误应该报错
const userPathsTestTypo: UserPaths = 'profle.name';

// 测试 2: ObjectKeyBinding 的泛型约束
const user: User = {
  id: 1,
  profile: {
    name: 'Alice',
    email: 'alice@example.com',
    contacts: {
      phone: '123-456-7890',
      address: 'Somewhere',
    },
  },
  settings: {
    theme: 'light',
    notifications: true,
  },
};

const correctBinding: ObjectKeyBinding<User, string> = {
  target: user,
  key: 'profile.name', // ✅ IDE 应该有代码补全提示
};

const correctBinding2: ObjectKeyBinding<User, boolean> = {
  target: user,
  key: 'settings.notifications', // ✅ IDE 应该有代码补全提示
};

// @ts-expect-error 无效的 key
const invalidBinding: ObjectKeyBinding<User, string> = {
  target: user,
  key: 'invalid.deep.path',
};

// 测试 3: App.markDirty 的重载和 IDE 提示
const app = new App(document.getElementById('app')!);

// 旧用法：路径字符串（全局 model）
app.markDirty('form.username'); // ✅ 通过

// 新用法：对象级，带 IDE 提示
app.markDirty(user, 'profile.name'); // ✅ IDE 应该补全 profile.name
app.markDirty(user, 'settings.theme'); // ✅ IDE 应该补全 settings.theme
app.markDirty(user, 'profile.contacts.phone'); // ✅ IDE 应该补全深层路径

// @ts-expect-error 无效的 key
app.markDirty(user, 'invalid.path');

// @ts-expect-error 拼写错误
app.markDirty(user, 'profle.name');

// 测试 4: markDirtyAll 的参数
app.markDirtyAll(user); // ✅ 通过

// 测试 5: 在组件绑定中使用 ObjectKeyBinding
const settings = {
  darkMode: false,
  fontSize: 14,
};

app.add.Checkbox({
  id: 'darkModeToggle',
  bind: {
    checked: {
      target: settings,
      key: 'darkMode', // ✅ IDE 应该补全 'darkMode' 或 'fontSize'
    },
  },
});

// 验证类型的一致性（darkMode 是 boolean，checked 应该也是 boolean）
app.add.Checkbox({
  id: 'themeToggle',
  bind: {
    checked: {
      target: user,
      key: 'settings.notifications', // ✅ notifications 是 boolean，匹配 checked
    },
  },
});

// 测试 6: 多个对象绑定
const form = {
  username: 'admin',
  password: '',
};

app.add.Input({
  id: 'username',
  bind: {
    value: {
      target: form,
      key: 'username', // ✅ IDE 补全
    },
  },
});

app.add.Input({
  id: 'password',
  bind: {
    value: {
      target: form,
      key: 'password', // ✅ IDE 补全
    },
  },
});

// 两个不同对象的脏标记
app.markDirty(user, 'profile.name');
app.markDirty(form, 'username');

// 总结：
// ✅ ObjectKeyPathOf<T> 类型能够推导出所有可能的点分隔路径
// ✅ ObjectKeyBinding 的 key 参数带有类型约束
// ✅ App.markDirty 的高亮演示了如何使用泛型重载获得 IDE 提示
// ✅ 错误的路径会在编译时被捕获
// ✅ IDE 应该在编辑时提供代码补全和类型检查

