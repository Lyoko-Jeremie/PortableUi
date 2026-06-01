/// <reference path="../types/style-modules.d.ts" />
import 'zone.js';

import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import {App, Container, HtmlContainer, HtmlLabel, type BindingContext} from '../../src';
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

const createShowcaseGroup = (title: string): {group: HTMLElement; body: HTMLElement} => {
  const group = document.createElement('section');
  group.style.display = 'flex';
  group.style.flexDirection = 'column';
  group.style.gap = '10px';
  group.style.marginBottom = '14px';

  const heading = document.createElement('h3');
  heading.textContent = title;
  heading.style.margin = '0';
  heading.style.fontSize = '16px';

  const body = document.createElement('div');
  body.style.display = 'grid';
  body.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
  body.style.gap = '12px';

  group.append(heading, body);
  return {group, body};
};

const createShowcaseHost = (title: string, target: HTMLElement): HTMLElement => {
  const host = document.createElement('div');
  host.style.border = '1px solid #e5e7eb';
  host.style.borderRadius = '8px';
  host.style.padding = '10px';
  host.style.background = '#fff';

  const heading = document.createElement('div');
  heading.textContent = title;
  heading.style.fontSize = '12px';
  heading.style.fontWeight = '600';
  heading.style.marginBottom = '8px';
  heading.style.color = '#374151';

  const mountPoint = document.createElement('div');
  mountPoint.style.display = 'flex';
  mountPoint.style.flexWrap = 'wrap';
  mountPoint.style.gap = '8px';
  mountPoint.style.alignItems = 'center';

  host.append(heading, mountPoint);
  target.appendChild(host);
  return mountPoint;
};

const createInlineBox = (text: string): HTMLElement => {
  const node = document.createElement('div');
  node.textContent = text;
  node.style.padding = '6px 10px';
  node.style.borderRadius = '6px';
  node.style.background = '#eef2ff';
  node.style.color = '#1e3a8a';
  node.style.fontSize = '12px';
  return node;
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
const showcaseCard = createCard('4. 全量组件展示', '此区域集中展示当前库中的基础、复杂和容器组件。');

grid.append(bindingCard.card, asyncCard.card, notesCard.card, showcaseCard.card);
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

const tabsCardA = new Container({
  id: 'zone-show-tabs-content-a',
  direction: 'vertical',
  gap: 6,
  children: [createInlineBox('Tab A content')],
});
const tabsCardB = new Container({
  id: 'zone-show-tabs-content-b',
  direction: 'vertical',
  gap: 6,
  children: [createInlineBox('Tab B content')],
});

const showcaseModal = app.add.Modal({
  id: 'zone-show-modal',
  title: 'Modal 组件',
  content: '这个弹窗用于演示 Modal 在 zonejs 页面中的展示。',
  visible: false,
  width: 360,
});

const showcaseToast = app.add.Toast({
  id: 'zone-show-toast',
  message: 'Toast 组件已挂载',
  type: 'info',
  visible: false,
  duration: 1800,
});

app.add.Label({
  id: 'zone-show-label',
  text: 'Label 组件',
});
app.add.Input({
  id: 'zone-show-input',
  placeholder: 'Input 组件',
  value: 'hello zonejs',
});
app.add.Button({
  id: 'zone-show-button',
  text: 'Button 组件',
});
app.add.TextBox({
  id: 'zone-show-textbox',
  rows: 3,
  value: 'TextBox 组件\n支持多行文本',
});
app.add.Select({
  id: 'zone-show-select',
  options: [
    {label: 'Option A', value: 'a'},
    {label: 'Option B', value: 'b'},
  ],
  value: 'a',
});
app.add.Checkbox({
  id: 'zone-show-checkbox',
  label: 'Checkbox 组件',
  checked: true,
});
app.add.Radio({
  id: 'zone-show-radio',
  label: 'Radio 组件',
  name: 'zone-show-radio-group',
  checked: true,
});
app.add.Slider({
  id: 'zone-show-slider',
  min: 0,
  max: 100,
  value: 35,
});
app.add.DatePicker({
  id: 'zone-show-date',
  value: '2026-06-01',
});
app.add.FileUpload({
  id: 'zone-show-file',
  multiple: true,
});
app.add.Image({
  id: 'zone-show-image',
  src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%2290%22%3E%3Crect width=%22180%22 height=%2290%22 fill=%22%23dbeafe%22/%3E%3Ctext x=%2290%22 y=%2250%22 font-size=%2214%22 text-anchor=%22middle%22 fill=%22%231e3a8a%22%3EImage Component%3C/text%3E%3C/svg%3E',
  alt: 'zonejs image demo',
  width: 180,
  height: 90,
});
app.add.Canvas({
  id: 'zone-show-canvas',
  width: 180,
  height: 90,
  onDraw: (_self, ctx, canvas) => {
    ctx.fillStyle = '#e0e7ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3730a3';
    ctx.font = '14px sans-serif';
    ctx.fillText('Canvas Component', 24, 48);
  },
});

app.add.Autocomplete({
  id: 'zone-show-autocomplete',
  value: 'ap',
  minChars: 1,
  options: ['Apple', 'Apricot', 'Banana', 'Orange'],
});
app.add.CascadingSelect({
  id: 'zone-show-cascading',
  valuePath: ['cn', 'sh'],
  options: [
    {
      label: 'China',
      value: 'cn',
      children: [
        {label: 'Shanghai', value: 'sh'},
        {label: 'Beijing', value: 'bj'},
      ],
    },
    {
      label: 'USA',
      value: 'us',
      children: [
        {label: 'New York', value: 'ny'},
        {label: 'Seattle', value: 'sea'},
      ],
    },
  ],
});
app.add.Progress({
  id: 'zone-show-progress',
  value: 68,
  showLabel: true,
});
app.add.Table({
  id: 'zone-show-table',
  columns: [
    {key: 'name', title: 'Name'},
    {key: 'score', title: 'Score'},
  ],
  data: [
    {name: 'Ada', score: 98},
    {name: 'Bob', score: 86},
  ],
});
app.add.TreeView({
  id: 'zone-show-tree',
  expandedIds: ['root'],
  nodes: [
    {
      id: 'root',
      label: 'Root Node',
      children: [
        {id: 'child-a', label: 'Child A'},
        {id: 'child-b', label: 'Child B'},
      ],
    },
  ],
});
app.add.Tabs({
  id: 'zone-show-tabs',
  tabs: [
    {id: 'tab-a', title: 'Tab A', content: tabsCardA},
    {id: 'tab-b', title: 'Tab B', content: tabsCardB},
  ],
  activeTabId: 'tab-a',
});
app.add.Button({
  id: 'zone-show-open-modal',
  text: '打开 Modal',
  onClick: () => showcaseModal.open(),
});
app.add.Button({
  id: 'zone-show-show-toast',
  text: '触发 Toast',
  onClick: () => showcaseToast.show('Toast 触发成功', 'success'),
});

app.add.Container({
  id: 'zone-show-container',
  direction: 'horizontal',
  gap: 8,
  children: [createInlineBox('Container child 1'), createInlineBox('Container child 2')],
});
app.add.Flex({
  id: 'zone-show-flex',
  gap: 8,
  children: [createInlineBox('Flex A'), createInlineBox('Flex B')],
});
app.add.Grid({
  id: 'zone-show-grid',
  columns: 2,
  gap: 8,
  children: [createInlineBox('Grid 1'), createInlineBox('Grid 2'), createInlineBox('Grid 3')],
});
app.add.GridItem({
  id: 'zone-show-griditem',
  columnSpan: 2,
  children: [createInlineBox('Standalone GridItem')],
});
app.add.Group({
  id: 'zone-show-group',
  title: 'Group 标题',
  gap: 8,
  children: [createInlineBox('Group body')],
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

const showcaseRoot = document.createElement('div');
showcaseRoot.style.display = 'flex';
showcaseRoot.style.flexDirection = 'column';
showcaseRoot.style.gap = '8px';

const basicShowcase = createShowcaseGroup('基础组件');
const complexShowcase = createShowcaseGroup('复杂组件');
const containerShowcase = createShowcaseGroup('容器组件');

showcaseRoot.append(basicShowcase.group, complexShowcase.group, containerShowcase.group);
showcaseCard.body.appendChild(showcaseRoot);

const appendComponentToShowcase = (id: string, title: string, target: HTMLElement): void => {
  const mountPoint = createShowcaseHost(title, target);
  appendById(id, mountPoint);
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

appendComponentToShowcase('zone-show-label', 'Label', basicShowcase.body);
appendComponentToShowcase('zone-show-input', 'Input', basicShowcase.body);
appendComponentToShowcase('zone-show-button', 'Button', basicShowcase.body);
appendComponentToShowcase('zone-show-textbox', 'TextBox', basicShowcase.body);
appendComponentToShowcase('zone-show-select', 'Select', basicShowcase.body);
appendComponentToShowcase('zone-show-checkbox', 'Checkbox', basicShowcase.body);
appendComponentToShowcase('zone-show-radio', 'Radio', basicShowcase.body);
appendComponentToShowcase('zone-show-slider', 'Slider', basicShowcase.body);
appendComponentToShowcase('zone-show-date', 'DatePicker', basicShowcase.body);
appendComponentToShowcase('zone-show-file', 'FileUpload', basicShowcase.body);
appendComponentToShowcase('zone-show-image', 'Image', basicShowcase.body);
appendComponentToShowcase('zone-show-canvas', 'Canvas', basicShowcase.body);

const htmlLabelHost = createShowcaseHost('HtmlLabel', basicShowcase.body);
const htmlLabel = new HtmlLabel({
  id: 'zone-show-html-label',
  html: '<strong>HtmlLabel</strong> 支持 <em>innerHTML</em>',
});
htmlLabel.mount(htmlLabelHost);

appendComponentToShowcase('zone-show-autocomplete', 'Autocomplete', complexShowcase.body);
appendComponentToShowcase('zone-show-cascading', 'CascadingSelect', complexShowcase.body);
appendComponentToShowcase('zone-show-progress', 'Progress', complexShowcase.body);
appendComponentToShowcase('zone-show-table', 'Table', complexShowcase.body);
appendComponentToShowcase('zone-show-tree', 'TreeView', complexShowcase.body);
appendComponentToShowcase('zone-show-tabs', 'Tabs', complexShowcase.body);
appendComponentToShowcase('zone-show-open-modal', 'Modal Trigger Button', complexShowcase.body);
appendComponentToShowcase('zone-show-show-toast', 'Toast Trigger Button', complexShowcase.body);
appendComponentToShowcase('zone-show-toast', 'Toast', complexShowcase.body);
appendComponentToShowcase('zone-show-modal', 'Modal', complexShowcase.body);

appendComponentToShowcase('zone-show-container', 'Container', containerShowcase.body);
appendComponentToShowcase('zone-show-flex', 'Flex', containerShowcase.body);
appendComponentToShowcase('zone-show-grid', 'Grid', containerShowcase.body);
appendComponentToShowcase('zone-show-griditem', 'GridItem', containerShowcase.body);
appendComponentToShowcase('zone-show-group', 'Group', containerShowcase.body);

const htmlContainerHost = createShowcaseHost('HtmlContainer', containerShowcase.body);
const htmlContainer = new HtmlContainer({
  id: 'zone-show-html-container',
  html: '<div style="padding:6px 10px;border-radius:6px;background:#ecfeff;color:#155e75;">HtmlContainer raw HTML</div>',
});
htmlContainer.mount(htmlContainerHost);

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

