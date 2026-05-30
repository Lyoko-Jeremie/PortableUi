# 易用性适配器

## 声明式接口

已实现声明式适配器入口：`CreatePortableUi`。

```typescript
import {CreatePortableUi} from 'PortableUi';

const el = document.getElementById('app');
if (!el) {
  throw new Error('Missing #app');
}

const ui = CreatePortableUi(el, {
  id: 'my-ui',
  children: {
    button1: {
      type: 'Button',
      props: {
        // Button 支持 text；适配器也兼容 label -> text
        label: 'Click Me',
        onClick: () => alert('Button 1 clicked!'),
      },
    },
    button2: {
      type: 'Button',
      props: {
        text: 'Click Me Too',
        onClick: () => alert('Button 2 clicked!'),
      },
    },
  },
});

// 通过 id 获取实例
const button1 = ui.getComponent('button1');
console.log(button1?.getId());
```

### 嵌套声明式结构

```typescript
import {CreatePortableUi} from 'PortableUi';

const el = document.getElementById('app');
if (!el) {
  throw new Error('Missing #app');
}

const ui = CreatePortableUi(el, {
  children: {
    panel: {
      type: 'Container',
      props: {
        direction: 'vertical',
        gap: 8,
      },
      children: {
        title: {
          type: 'Label',
          props: {text: '操作面板'},
        },
        action: {
          type: 'Button',
          props: {text: 'Run'},
        },
      },
    },
  },
});

// 销毁时会按逆序卸载组件
ui.destroy();
```

### 适配器返回对象

`CreatePortableUi(...)` 返回：

- `id?: string` - 根配置 id
- `root: HTMLElement` - 根容器
- `getComponent(id)` - 按 id 获取组件
- `getAllComponents()` - 获取所有已创建组件
- `destroy()` - 卸载并清理全部组件

### 更严格的类型约束（TypeScript）

适配器现在把 `type` 和对应组件 `props` 关联起来，推荐这样写：

```typescript
import {CreatePortableUi, type PortableUiDeclarativeConfig, type BuiltInDeclarativeRegistry} from 'PortableUi';

const config: PortableUiDeclarativeConfig<BuiltInDeclarativeRegistry> = {
  children: {
    okButton: {
      type: 'Button',
      props: {
        text: 'OK',
        // 兼容写法：label 也可用
        label: 'OK',
      },
    },
  },
};

CreatePortableUi(document.getElementById('app')!, config);
```

如果你有自定义组件，使用 `createPortableUiFactory` 能获得同样严格的类型推导：

```typescript
import {BaseComponent, createPortableUiFactory, type PortableUiDeclarativeConfig} from 'PortableUi';

class Badge extends BaseComponent {
  protected render(): HTMLElement {
    const el = document.createElement('span');
    el.textContent = String(this.getProps().text ?? '');
    return el;
  }
}

const registry = {Badge};
const createUi = createPortableUiFactory(registry);

const config: PortableUiDeclarativeConfig<typeof registry> = {
  children: {
    badge1: {
      type: 'Badge',
      props: {text: 'typed custom'},
    },
  },
};

createUi(document.getElementById('app')!, config);
```

### 测试

新增测试文件：`test/adaptor/CreatePortableUi.test.ts`，覆盖：

- 对象形式 children 的创建与挂载
- 嵌套 children 的挂载
- 数组 children 与 `destroy()` 清理
- 未知组件类型报错
