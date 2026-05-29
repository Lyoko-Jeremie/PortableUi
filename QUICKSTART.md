# PortableUi 快速开始指南

## 项目结构概览

```
PortableUi/
├── src/                              # 源代码
│   ├── index.ts                      # 主入口
│   ├── core/                         # 核心系统
│   │   ├── BaseComponent.ts          # 基础组件类
│   │   ├── EventSystem.ts            # 事件系统
│   │   ├── StateManager.ts           # 状态管理
│   │   └── StyleIsolation.ts         # 样式隔离
│   ├── types/                        # 类型定义
│   ├── styles/                       # 样式系统
│   │   ├── StyleManager.ts           # 样式管理器
│   │   ├── CSS.ts                    # CSS 工具
│   │   ├── theme.ts                  # 主题定义
│   │   └── tokens/                   # 设计令牌
│   ├── utils/                        # 工具函数
│   │   ├── dom.ts                    # DOM 操作
│   │   ├── types.ts                  # 类型检查
│   │   ├── helpers.ts                # 辅助函数
│   │   └── responsive.ts             # 响应式工具
│   ├── layout/                       # 布局系统
│   ├── i18n/                         # 国际化系统
│   │   └── locales/                  # 语言文件
│   └── components/                   # 组件库（待开发）
├── plan.md                           # 开发计划
├── ARCHITECTURE.md                   # 架构文档
├── package.json                      # 项目配置
└── tsconfig.json                     # TypeScript 配置
```

## 编译和开发

### 编译项目
```bash
npx tsc
```

### 检查编译错误
```bash
npx tsc --noEmit
```

### 监视模式编译
```bash
npx tsc --watch
```

## 核心功能使用

### 1. 状态管理

```typescript
import { stateManager } from 'PortableUi';

// 创建响应式状态
stateManager.createReactive('user', { name: 'John', age: 30 });

// 获取状态
const user = stateManager.get('user');

// 更新状态
stateManager.set('user', { name: 'Jane', age: 28 });

// 观察状态变化
const unwatch = stateManager.observe('user', (newUser, oldUser) => {
  console.log('User changed:', newUser);
});

// 停止观察
unwatch();

// 批量更新状态
stateManager.batch({
  count: 5,
  message: 'Hello'
});
```

### 2. 事件系统

```typescript
import { globalEventSystem } from 'PortableUi';

// 监听事件
const unsubscribe = globalEventSystem.on('userClick', (event) => {
  console.log('User clicked:', event.data);
});

// 一次性监听
globalEventSystem.once('userLogin', (event) => {
  console.log('User logged in');
});

// 触发事件
globalEventSystem.emit('userClick', { x: 100, y: 200 });

// 停止监听
unsubscribe();

// 获取事件历史
const history = globalEventSystem.getHistory();
```

### 3. 样式系统

```typescript
import { styleManager, CSS } from 'PortableUi';

// 注入样式
styleManager.injectStyle('myStyles', `
  .container {
    display: flex;
    gap: 16px;
  }
`);

// 生成 CSS
const css = CSS.rule('.button', {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '8px 16px'
});

// 切换主题
import { darkTheme, lightTheme } from 'PortableUi';
styleManager.setTheme(darkTheme);

// 获取主题颜色
const primaryColor = styleManager.getThemeColor('primary');

// 监听主题变化
styleManager.observeTheme((theme) => {
  console.log('Theme changed to:', theme.name);
});
```

### 4. 国际化

```typescript
import { i18nManager } from 'PortableUi';

// 设置语言
i18nManager.setLanguage('zh');

// 获取翻译
const okText = i18nManager.t('common.ok'); // "确定"

// 获取带参数的翻译
const message = i18nManager.t('validation.minLength', { min: 6 });

// 监听语言变化
i18nManager.onLanguageChange((newLang, oldLang) => {
  console.log(`Language changed from ${oldLang} to ${newLang}`);
});

// 获取可用语言
const languages = i18nManager.getAvailableLanguages(); // ['en', 'zh']

// 添加自定义语言
import { LocaleStrings } from 'PortableUi';
const customLocale: LocaleStrings = { /* ... */ };
i18nManager.loadLanguage('ja', customLocale);
```

### 5. DOM 操作工具

```typescript
import { 
  createElement, 
  addClass, 
  removeClass,
  setStyle,
  getPosition,
  addEventListener
} from 'PortableUi';

// 创建元素
const button = createElement('button', 
  { class: 'btn', onclick: 'handleClick()' },
  ['Click me']
);

// 管理 CSS 类
addClass(button, 'active');
removeClass(button, 'disabled');

// 设置样式
setStyle(button, {
  backgroundColor: 'blue',
  color: 'white'
});

// 获取位置信息
const pos = getPosition(button);
console.log(pos); // { top: 100, left: 50, width: 80, height: 40 }

// 添加事件监听
const off = addEventListener(button, 'click', () => {
  console.log('Button clicked');
});

// 取消监听
off();
```

### 6. 响应式设计

```typescript
import {
  getViewportWidth,
  isAboveBreakpoint,
  getCurrentBreakpoint,
  isMobileDevice,
  isDarkMode,
  onViewportChange
} from 'PortableUi';

// 获取视口信息
console.log(getViewportWidth()); // 1024
console.log(getViewportHeight()); // 768

// 检查断点
if (isAboveBreakpoint('md')) {
  console.log('Desktop view');
}

// 获取当前断点
const currentBreakpoint = getCurrentBreakpoint(); // 'lg'

// 设备检测
if (isMobileDevice()) {
  console.log('Mobile device');
}

// 主题检测
if (isDarkMode()) {
  console.log('Dark mode is enabled');
}

// 监听视口变化
const unwatch = onViewportChange(() => {
  console.log('Viewport changed');
}, 150); // 防抖延迟 150ms

// 停止监听
unwatch();
```

### 7. 布局系统

```typescript
import { LayoutEngine } from 'PortableUi';

// 创建水平布局
const hLayoutCss = LayoutEngine.createHorizontalLayout({
  justifyContent: 'center',
  alignItems: 'center',
  gap: 16,
  padding: 20
});

// 创建垂直布局
const vLayoutCss = LayoutEngine.createVerticalLayout({
  justifyContent: 'space-between',
  gap: 12
});

// 创建网格布局
const gridCss = LayoutEngine.createGridLayout({
  columns: 3,
  gap: 20,
  columnGap: 16,
  rowGap: 24
});

// 创建网格项目
const gridItemCss = LayoutEngine.createGridItemLayout({
  columnSpan: 2,
  rowSpan: 1
});
```

### 8. 类型检查工具

```typescript
import {
  isNil,
  isEmpty,
  isObject,
  isArray,
  isString,
  deepClone,
  merge,
  getPath,
  setPath
} from 'PortableUi';

// 类型检查
console.log(isNil(null)); // true
console.log(isEmpty('')); // true
console.log(isObject({})); // true
console.log(isArray([])); // true

// 对象操作
const original = { a: { b: { c: 1 } } };
const cloned = deepClone(original);

// 获取和设置嵌套属性
const value = getPath(original, 'a.b.c'); // 1
setPath(original, 'a.b.d', 2); // { a: { b: { c: 1, d: 2 } } }
```

### 9. 辅助函数

```typescript
import {
  debounce,
  throttle,
  generateId,
  retry,
  promisePool,
  memoize
} from 'PortableUi';

// 防抖
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

// 节流
const handleScroll = throttle(() => {
  console.log('Scrolled');
}, 1000);

// 生成唯一 ID
const id = generateId('component'); // 'component-a1b2c3d4-1234567890'

// 重试异步操作
const result = await retry(
  () => fetch('/api/data'),
  3, // 最多重试 3 次
  1000 // 每次延迟 1000ms
);

// 并发任务池
const tasks = [
  () => Promise.resolve(1),
  () => Promise.resolve(2),
  () => Promise.resolve(3)
];
const results = await promisePool(tasks, 2); // 最多 2 个并发

// 缓存装饰器
const expensiveComputation = memoize((n) => {
  return n * 2;
});
```

## 创建自定义组件

```typescript
import { BaseComponent } from 'PortableUi';

class MyButton extends BaseComponent {
  protected render() {
    const btn = document.createElement('button');
    btn.textContent = this.props.text || 'Click me';
    btn.onclick = () => {
      this.props.onClick?.();
    };
    return btn;
  }
}

// 使用组件
const button = new MyButton({
  text: 'Submit',
  onClick: () => console.log('Clicked')
});

button.mount(document.body);
```

## 常见场景

### 场景 1: 响应式 UI 组件

```typescript
import { stateManager, onViewportChange } from 'PortableUi';

class ResponsivePanel {
  constructor() {
    stateManager.createReactive('isSmallScreen', false);
    
    onViewportChange(() => {
      const isSmall = getViewportWidth() < 768;
      stateManager.set('isSmallScreen', isSmall);
    });
  }
}
```

### 场景 2: 多语言表单

```typescript
import { i18nManager, globalEventSystem } from 'PortableUi';

class FormValidator {
  validate(field, value) {
    const messages = {
      en: 'Field is required',
      zh: '字段必填'
    };
    
    if (!value) {
      globalEventSystem.emit('validationError', {
        message: messages[i18nManager.getLanguage()]
      });
      return false;
    }
    return true;
  }
}
```

### 场景 3: 主题切换

```typescript
import { styleManager, lightTheme, darkTheme } from 'PortableUi';

class ThemeSwitcher {
  toggle() {
    const current = styleManager.getTheme();
    const next = current.name === 'light' ? darkTheme : lightTheme;
    styleManager.setTheme(next);
    
    // 保存到本地存储
    localStorage.setItem('theme', next.name);
  }
}
```

## 最佳实践

1. **使用单例对象** - 直接使用全局单例（globalEventSystem, stateManager 等）
2. **类型安全** - 充分利用 TypeScript 类型系统
3. **函数式编程** - 优先使用工具函数而不是类
4. **内存管理** - 及时取消事件监听和观察者
5. **样式隔离** - 使用 Shadow DOM 避免样式冲突

## 问题排查

### 编译错误
检查 TypeScript 版本是否正确：
```bash
npx tsc --version
```

### 类型错误
确保导入了正确的类型定义。

### 样式不生效
检查是否启用了样式隔离，并正确注入了样式。

## 下一步

1. 查看 `plan.md` 了解详细的开发计划
2. 查看 `ARCHITECTURE.md` 了解完整的架构设计
3. 开始实现基础组件

---

**更新时间**: 2026-05-30

