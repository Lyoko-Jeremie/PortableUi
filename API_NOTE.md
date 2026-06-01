

在 BindingEngine.ts 第 481-486 行，系统只会订阅有 `subscribe` 方法的 `accessor`：

```typescript
if (isAccessor(source) && typeof source.subscribe === 'function') {
  const dispose = source.subscribe(() => {
    this.queueComponentRefresh(prepared.componentId, registration);
  });
  disposers.push(dispose);
}
```

普通 `accessor` `{ get: () => ... }` 没有 `subscribe` 方法，所以不会被追踪，导致数据变化后 label 不更新


解决方案：

方案 1: 改用 ObjectKeyBinding（推荐）

```typescript
c.add.Checkbox({
  id: 'isAutoInstallEnchantedRestraintsPatch',
  bind: {
    checked: {
      target: StateEnchantedRestraintsPatch,
      key: 'AutoInstall',
    },
    label: {
      target: StateEnchantedRestraintsPatch,
      key: 'AutoInstall',  // 直接绑定数据
      mode: 'ro',  // 只读
    }
  },
});
```

然后为 label 添加自定义转换器（如果需要）。

方案 2: 使用 Signal（推荐用于复杂逻辑）

```typescript
import { computed } from 'alien-signals';

const labelSignal = computed(() => 
  StringTable.isAutoInstallEnchantedRestraintsPatchMask(
    StateEnchantedRestraintsPatch.AutoInstall
  )
);

c.add.Checkbox({
  id: 'isAutoInstallEnchantedRestraintsPatch',
  bind: {
    checked: {
      target: StateEnchantedRestraintsPatch,
      key: 'AutoInstall',
    },
    label: labelSignal,  // Signal 会被自动追踪
  },
});
```

方案 3: 为 accessor 添加 subscribe 方法

```typescript
const labelAccessor = {
  get: () => StringTable.isAutoInstallEnchantedRestraintsPatchMask(
    StateEnchantedRestraintsPatch.AutoInstall
  ),
  subscribe: (notify: () => void) => {
    // 监听 StateEnchantedRestraintsPatch 变化
    StateEnchantedRestraintsPatch.on?.('AutoInstall', notify);
    
    // 返回取消订阅函数
    return () => {
      StateEnchantedRestraintsPatch.off?.('AutoInstall', notify);
    };
  },
};

c.add.Checkbox({
  id: 'isAutoInstallEnchantedRestraintsPatch',
  bind: {
    checked: {
      target: StateEnchantedRestraintsPatch,
      key: 'AutoInstall',
    },
    label: labelAccessor,
  },
});
```

建议使用方案 1 或 2，因为更简洁、类型安全


