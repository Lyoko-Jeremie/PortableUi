# 易用性适配器

## 声明式接口

设计一个适配器，将当前库的使用方法从设计式改为声明式。

```typescript
// 声明式接口写法范例
import { CreatePortableUi } from 'xxx/adaptor/xxxx';

const el = document.getElementById('app');

const ui = CreatePortableUi(el, {
  id: 'my-ui',
  children: {
    'button1': {
      type: 'Button',
      props: {
        label: 'Click Me',
        onClick: () => alert('Button 1 clicked!')
      }
    },
    'button2': {
      type: 'Button',
      props: {
        label: 'Click Me Too',
        onClick: () => alert('Button 2 clicked!')
      }
    },
  }
});

```
