/**
 * 完整示例：使用 ObjectKeyBinding IDE 提示构建响应式表单
 *
 * 此示例演示：
 * 1. 如何定义类型化的数据结构
 * 2. 如何在 bind 中获得完整的 IDE 代码补全
 * 3. 如何在 markDirty 中获得类型检查
 * 4. 如何处理复杂的嵌套数据
 */

import {App} from '../../src/adaptor/App';
import type {ObjectKeyPathOf} from '../../src/adaptor/types';

// ============================================================================
// 第一步：定义数据模型
// ============================================================================

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    showProfile: boolean;
    allowMessages: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'zh' | 'es' | 'fr';
}

interface User {
  id: number;
  profile: UserProfile;
  address: Address;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 第二步：初始化数据
// ============================================================================

const currentUser: User = {
  id: 1,
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    birthDate: '1990-01-01',
  },
  address: {
    street: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
  },
  settings: {
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      showProfile: true,
      allowMessages: true,
    },
    theme: 'light',
    language: 'en',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T12:00:00Z',
};

// ============================================================================
// 第三步：创建应用并构建表单
// ============================================================================

const app = new App(document.getElementById('app')!);

// 创建个人资料区域
const profileContainer = app.add.Container({id: 'profile-section'});

// firstName - IDE 会补全 profile.firstName
profileContainer.add.Input({
  id: 'firstName',
  placeholder: 'First Name',
  bind: {
    value: {
      target: currentUser,
      key: 'profile.firstName', // ✅ 输入 'profile.' 后会看到代码补全
    },
  },
});

// lastName - 同样享受 IDE 提示
profileContainer.add.Input({
  id: 'lastName',
  placeholder: 'Last Name',
  bind: {
    value: {
      target: currentUser,
      key: 'profile.lastName',
    },
  },
});

// email
profileContainer.add.Input({
  id: 'email',
  type: 'email',
  placeholder: 'Email',
  bind: {
    value: {
      target: currentUser,
      key: 'profile.email',
    },
  },
});

// phone
profileContainer.add.Input({
  id: 'phone',
  type: 'tel',
  placeholder: 'Phone',
  bind: {
    value: {
      target: currentUser,
      key: 'profile.phone',
    },
  },
});

// 创建地址区域
const addressContainer = app.add.Container({id: 'address-section'});

addressContainer.add.Input({
  id: 'street',
  placeholder: 'Street',
  bind: {
    value: {
      target: currentUser,
      key: 'address.street', // ✅ IDE 会补全 address.* 的所有字段
    },
  },
});

addressContainer.add.Input({
  id: 'city',
  placeholder: 'City',
  bind: {
    value: {
      target: currentUser,
      key: 'address.city',
    },
  },
});

addressContainer.add.Select({
  id: 'country',
  options: [
    {label: 'USA', value: 'USA'},
    {label: 'Canada', value: 'Canada'},
  ],
  bind: {
    value: {
      target: currentUser,
      key: 'address.country', // ✅ IDE 提示
    },
  },
});

// 创建设置区域
const settingsContainer = app.add.Container({id: 'settings-section'});

// 通知设置 - 嵌套深度为 2 的 boolean
settingsContainer.add.Checkbox({
  id: 'notifyEmail',
  label: 'Email Notifications',
  bind: {
    checked: {
      target: currentUser,
      key: 'settings.notifications.email', // ✅ IDE 补全深层路径
    },
  },
});

settingsContainer.add.Checkbox({
  id: 'notifySms',
  label: 'SMS Notifications',
  bind: {
    checked: {
      target: currentUser,
      key: 'settings.notifications.sms',
    },
  },
});

// 隐私设置
settingsContainer.add.Checkbox({
  id: 'showProfile',
  label: 'Show Profile to Others',
  bind: {
    checked: {
      target: currentUser,
      key: 'settings.privacy.showProfile', // ✅ IDE 提示嵌套的 privacy
    },
  },
});

// 主题选择
settingsContainer.add.Select({
  id: 'theme',
  options: [
    {label: 'Light', value: 'light'},
    {label: 'Dark', value: 'dark'},
    {label: 'Auto', value: 'auto'},
  ],
  bind: {
    value: {
      target: currentUser,
      key: 'settings.theme', // ✅ IDE 知道 theme 的有效值
    },
  },
});

// 语言选择
settingsContainer.add.Select({
  id: 'language',
  options: [
    {label: 'English', value: 'en'},
    {label: '中文', value: 'zh'},
    {label: 'Español', value: 'es'},
  ],
  bind: {
    value: {
      target: currentUser,
      key: 'settings.language',
    },
  },
});

// ============================================================================
// 第四步：添加行为和事件处理
// ============================================================================

// 保存按钮 - 展示 ctx.touch 和 markDirty 的使用
app.add.Button({
  id: 'saveBtn',
  text: 'Save Profile',
  bind: {
    onClick: (ctx) => {
      console.log('Saving user profile...');

      // 更新时间戳
      currentUser.updatedAt = new Date().toISOString();

      // 方式1：使用 ctx.touch 在回调内标记（推荐用于回调内）
      ctx.touch('updatedAt');

      // 方式2：也可以触发完整刷新
      ctx.touch();

      // 显示测试标签
      app.add.Label({
        id: 'saveStatus',
        text: `✓ Saved at ${new Date().toLocaleTimeString()}`,
      });
    },
  },
});

// 重置按钮 - 展示 markDirtyAll
app.add.Button({
  id: 'resetBtn',
  text: 'Reset to Default',
  bind: {
    onClick: (ctx) => {
      // 重置为初始值（这里简化处理）
      currentUser.profile.firstName = 'John';
      currentUser.profile.lastName = 'Doe';

      // IDE 会根据 currentUser 的类型建议有效的 key
      app.markDirty(currentUser, 'profile.firstName');
      app.markDirty(currentUser, 'profile.lastName');

      // 或者标记整个对象
      app.markDirtyAll(currentUser);
    },
  },
});

// ============================================================================
// 第五步：演示类型安全的外部更新
// ============================================================================

// 模拟外部数据源更新（如 API 调用）
setTimeout(() => {
  console.log('External update: User profile fetched from API');

  // 更新数据
  currentUser.profile.email = 'newemail@example.com';
  currentUser.settings.theme = 'dark';

  // IDE 会在这里检查 key 的有效性
  // ✅ 正确
  app.markDirty(currentUser, 'profile.email');
  app.markDirty(currentUser, 'settings.theme');

  // ❌ 这会导致编译错误（如果启用严格类型检查）
  // app.markDirty(currentUser, 'invalid.path');
}, 5000);

// ============================================================================
// 第六步：创建类型化的辅助函数
// ============================================================================

/**
 * 为特定字段创建标记脏函数
 * 这演示了如何在函数中获得完整的类型约束
 */
function markUserFieldDirty<T extends Record<string, any>>(
  data: T,
  field: ObjectKeyPathOf<T>,
): void {
  console.log(`Marking field dirty: ${field}`);
  app.markDirty(data, field);
}

// 使用函数 - IDE 会推导有效的字段
markUserFieldDirty(currentUser, 'profile.firstName'); // ✅
markUserFieldDirty(currentUser, 'address.zipCode'); // ✅
// markUserFieldDirty(currentUser, 'invalid'); // ❌ Error

// ============================================================================
// 总结
// ============================================================================

/*
这个示例展示了：

1. ✅ 类型定义：User, UserProfile, Address, UserSettings
2. ✅ 在 bind 中使用 ObjectKeyBinding，获得完整的 IDE 代码补全
3. ✅ 编译时类型检查，防止拼写错误
4. ✅ 支持任意嵌套深度（settings.notifications.email）
5. ✅ 在 markDirty 和 ctx.touch 中获得 IDE 提示
6. ✅ 函数参数中使用 ObjectKeyPathOf 获得泛型类型约束

建议在自己的应用中复用这些模式，充分利用 TypeScript 类型系统的优势。
*/

