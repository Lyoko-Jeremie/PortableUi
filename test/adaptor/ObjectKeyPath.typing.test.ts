import {it, expect} from '@jest/globals';
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

type _userPathsTest = UserPaths;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _userPathsTest: _userPathsTest = 'profile.name'; // ✅ 通过
type _userPathsTest2 = UserPaths;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _userPathsTest2: _userPathsTest2 = 'profile.contacts.phone'; // ✅ 通过
type _userPathsTest3 = UserPaths;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _userPathsTest3: _userPathsTest3 = 'settings.theme'; // ✅ 通过

// 错误路径应该报错
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _userPathsTestInvalid: UserPaths = 'invalid.path.here';

// 拼写错误应该报错
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _userPathsTestTypo: UserPaths = 'profle.name';

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

type _correctBinding = ObjectKeyBinding<User, string>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _correctBinding: _correctBinding = {
  target: user,
  key: 'profile.name', // ✅ IDE 应该有代码补全提示
};

type _correctBinding2 = ObjectKeyBinding<User, boolean>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _correctBinding2: _correctBinding2 = {
  target: user,
  key: 'settings.notifications', // ✅ IDE 应该有代码补全提示
};

// 无效的 key 应该报错
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _invalidBinding: ObjectKeyBinding<User, string> = {
  target: user,
  // @ts-expect-error TS2322
  key: 'invalid.deep.path',
};

// 测试 3: 在组件绑定中使用 ObjectKeyBinding
const settings = {
  darkMode: false,
  fontSize: 14,
};

// Note: These type tests verify that the binding system correctly handles ObjectKeyBinding.
// In a real application, you would use them like this, and the binding engine will handle them.
type _testBinding = ObjectKeyBinding<typeof settings, boolean>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _testBinding: _testBinding = {
  target: settings,
  key: 'darkMode', // ✅ IDE 应该补全 'darkMode' 或 'fontSize'
};

// 验证类型的一致性（darkMode 是 boolean，checked 应该也是 boolean）
type _themeBinding = ObjectKeyBinding<User, boolean>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _themeBinding: _themeBinding = {
  target: user,
  key: 'settings.notifications', // ✅ notifications 是 boolean，匹配 checked
};

// 测试 4: 多个对象绑定
const form = {
  username: 'admin',
  password: '',
};

type _usernameBinding = ObjectKeyBinding<typeof form, string>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _usernameBinding: _usernameBinding = {
  target: form,
  key: 'username', // ✅ IDE 补全
};

type _passwordBinding = ObjectKeyBinding<typeof form, string>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _passwordBinding: _passwordBinding = {
  target: form,
  key: 'password', // ✅ IDE 补全
};

// 总结：
// ✅ ObjectKeyPathOf<T> 类型能够推导出所有可能的点分隔路径
// ✅ ObjectKeyBinding 的 key 参数带有类型约束
// ✅ 类型推导在绑定中工作正常
// ✅ 错误的路径会在编译时被捕获
// ✅ IDE 应该在编辑时提供代码补全和类型检查

it('ObjectKeyPathOf and ObjectKeyBinding type tests pass at compile time', () => {
  // 所有类型检查均通过编译验证，此处为运行时占位断言
  expect(true).toBe(true);
});
