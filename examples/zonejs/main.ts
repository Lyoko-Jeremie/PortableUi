/// <reference path="../types/style-modules.d.ts" />
import 'zone.js';

import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import {App, type BindingContext} from '../../src';
import type {Label, Toast} from '../../src';
import {ensurePortableUiRootScope} from '../utils/ensurePortableUiRoot';
import {syncHeadStylesToShadowRoot} from '../utils/syncHeadStylesToShadowRoot';

ensurePortableUiRootScope();

type ZoneJsDemoModel = {
  profile: {
    name: string;
    active: boolean;
    city: string;
  };
  metrics: {
    counter: number;
    lastAsync: string;
  };
  actions: {
    reset: (ctx: BindingContext<ZoneJsDemoModel>) => void;
    runAsync: (ctx: BindingContext<ZoneJsDemoModel>) => void;
    syncNow: (ctx: BindingContext<ZoneJsDemoModel>) => void;
  };
};

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const getZoneName = (): string => {
  const zone = globalThis as typeof globalThis & {Zone?: {current?: {name?: string}}};
  return zone.Zone?.current?.name ?? 'unknown';
};

const app = new App(host, {
  id: 'zonejs-demo',
  styleIsolation: {mode: 'shadow'},
  model: {
    profile: {
      name: 'Ada Lovelace',
      active: true,
      city: 'London',
    },
    metrics: {
      counter: 0,
      lastAsync: '等待第一次异步操作',
    },
    actions: {
      reset: (ctx) => {
        ctx.model.profile.name = 'Ada Lovelace';
        ctx.model.profile.active = true;
        ctx.model.profile.city = 'London';
        ctx.model.metrics.counter = 0;
        ctx.model.metrics.lastAsync = `已重置（${getZoneName()}）`;
        ctx.markDirty('profile');
        ctx.markDirty('metrics');
      },
      runAsync: (ctx) => {
        ctx.model.metrics.lastAsync = `按钮点击时的 Zone：${getZoneName()}`;
        ctx.markDirty('metrics.lastAsync');
        statusLabel.setText(`当前 Zone：${getZoneName()}`);
        toast.show('已进入 Zone.js 绑定回调', 'info');
        appendLog(`click -> ${getZoneName()}`);

        Promise.resolve().then(() => {
          ctx.model.metrics.counter += 1;
          ctx.model.metrics.lastAsync = `Promise 微任务：${getZoneName()}`;
          ctx.markDirty('metrics.counter');
          ctx.markDirty('metrics.lastAsync');
          counterLabel.setText(`当前计数：${ctx.model.metrics.counter}`);
          statusLabel.setText(`Promise 回调中的 Zone：${getZoneName()}`);
          appendLog(`promise -> ${getZoneName()}`);

          setTimeout(() => {
            ctx.model.metrics.counter += 1;
            ctx.model.metrics.lastAsync = `setTimeout 宏任务：${getZoneName()}`;
            ctx.markDirty('metrics.counter');
            ctx.markDirty('metrics.lastAsync');
            counterLabel.setText(`当前计数：${ctx.model.metrics.counter}`);
            statusLabel.setText(`setTimeout 中的 Zone：${getZoneName()}`);
            appendLog(`timeout -> ${getZoneName()}`);
            toast.show('Promise / setTimeout 都保留了 Zone 上下文', 'success');
          }, 250);
        });
      },
      syncNow: (ctx) => {
        ctx.model.profile.city = ctx.model.profile.city === 'London' ? 'Shanghai' : 'London';
        ctx.model.metrics.lastAsync = `同步更新：${getZoneName()}`;
        ctx.markDirty('profile.city');
        ctx.markDirty('metrics.lastAsync');
        statusLabel.setText(`同步更新完成（${getZoneName()}）`);
        appendLog(`sync -> ${getZoneName()}`);
        toast.show('同步写入后手动 markDirty 即可刷新界面', 'warning');
      },
    },
  } satisfies ZoneJsDemoModel,
  bindingOptions: {
    proxy: false,
    warn: true,
    flush: 'microtask',
  },
});

if (app.shadowRoot) {
  syncHeadStylesToShadowRoot(app.shadowRoot);
}

app.root.classList.add('zonejs-root');

const createCard = (title: string, description: string): {card: HTMLElement; body: HTMLElement} => {
  const card = document.createElement('section');
  card.className = 'demo-card zonejs-card';

  const heading = document.createElement('div');
  heading.className = 'zonejs-card-title';
  heading.textContent = title;

  const desc = document.createElement('p');
  desc.className = 'zonejs-card-description';
  desc.textContent = description;

  const body = document.createElement('div');
  body.className = 'zonejs-card-body';

  card.append(heading, desc, body);
  return {card, body};
};

const appendById = (id: string, target: HTMLElement): void => {
  const component = app.getComponent(id);
  const element = component?.getElement();
  if (element) {
    target.appendChild(element);
  }
};

const hero = document.createElement('section');
hero.className = 'zonejs-hero';
hero.innerHTML = `
  <div class="zonejs-hero-copy">
    <h1>App + Zone.js 示例</h1>
    <p>
      这个页面展示了如何用 <code>App</code> 创建界面，并让 <code>zone.js</code>
      负责保留异步上下文；修改 model 后通过 <code>markDirty()</code> 主动刷新。
    </p>
  </div>
  <div class="zonejs-hero-badges">
    <span class="zonejs-badge">bind.value</span>
    <span class="zonejs-badge">bind.checked</span>
    <span class="zonejs-badge">bind.onClick</span>
    <span class="zonejs-badge">Promise</span>
    <span class="zonejs-badge">setTimeout</span>
    <span class="zonejs-badge">markDirty()</span>
  </div>
`;

const grid = document.createElement('div');
grid.className = 'zonejs-grid';

const bindingCard = createCard('1. 双向绑定', '输入框和复选框通过 App 的 bind 语法直接同步到 model。');
const asyncCard = createCard('2. Zone 异步回调', '点击按钮后触发 Promise 和 setTimeout，观察 Zone 上下文如何被保留。');
const notesCard = createCard('3. 使用说明', '这个示例不依赖额外框架，整页 UI 都由 App + 组件完成。');

grid.append(bindingCard.card, asyncCard.card, notesCard.card);
app.root.append(hero, grid);

const nameInput = app.add.Input({
  id: 'zone-name',
  placeholder: '姓名（绑定 profile.name）',
  bind: {
    value: 'profile.name',
  },
});
const activeCheckbox = app.add.Checkbox({
  id: 'zone-active',
  label: '启用 profile.active',
  bind: {
    checked: 'profile.active',
  },
});
const cityStatus = app.add.Label({
  id: 'zone-city',
  text: '当前城市会在“同步更新”按钮中切换。',
});
const statusLabel = app.add.Label({
  id: 'zone-status',
  text: `当前 Zone：${getZoneName()}`,
});
const counterLabel = app.add.Label({
  id: 'zone-counter',
  text: '当前计数：0',
});
const toast = app.add.Toast({
  id: 'zone-toast',
  visible: false,
  duration: 2200,
});

app.add.Button({
  id: 'zone-run-async',
  text: '运行 Promise + setTimeout',
  bind: {
    onClick: 'actions.runAsync',
  },
});

app.add.Button({
  id: 'zone-sync-now',
  text: '同步更新并 markDirty',
  bind: {
    onClick: 'actions.syncNow',
  },
});

app.add.Button({
  id: 'zone-reset',
  text: '重置示例',
  bind: {
    onClick: 'actions.reset',
  },
});

const formControls = document.createElement('div');
formControls.className = 'demo-controls zonejs-controls';

const statePanel = document.createElement('div');
statePanel.className = 'zonejs-state-panel';

const logPanel = document.createElement('div');
logPanel.className = 'zonejs-log-panel';
const logTitle = document.createElement('h3');
logTitle.textContent = '异步日志';
const logList = document.createElement('ol');
logList.className = 'zonejs-log-list';
logPanel.append(logTitle, logList);

const appendLog = (text: string): void => {
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString()} · ${text}`;
  logList.prepend(item);
};

appendById('zone-name', bindingCard.body);
appendById('zone-active', bindingCard.body);
appendById('zone-city', bindingCard.body);
appendById('zone-reset', formControls);
appendById('zone-sync-now', formControls);
appendById('zone-run-async', formControls);
appendById('zone-counter', statePanel);
appendById('zone-status', statePanel);
appendById('zone-toast', asyncCard.body);

bindingCard.body.append(formControls);
asyncCard.body.append(statePanel, logPanel);
notesCard.body.innerHTML = `
  <p>关键点：</p>
  <ul>
    <li>页面入口先 <code>import 'zone.js'</code>，再创建 <code>App</code>。</li>
    <li>表单字段用 <code>bind.value</code> / <code>bind.checked</code> 自动同步。</li>
    <li>关闭 <code>proxy</code> 后，手动修改 model 记得调用 <code>markDirty()</code>。</li>
    <li>在 Promise / 定时器回调里仍然能拿到当前 Zone。</li>
  </ul>
`;

statusLabel.setText(`当前 Zone：${getZoneName()}`);
counterLabel.setText(`当前计数：${app.getModel<ZoneJsDemoModel>().metrics.counter}`);
cityStatus.setText(`当前城市：${app.getModel<ZoneJsDemoModel>().profile.city}`);

appendLog(`initial -> ${getZoneName()}`);
appendLog('表单字段已经绑定到 model');

void nameInput;
void activeCheckbox;
void cityStatus;

