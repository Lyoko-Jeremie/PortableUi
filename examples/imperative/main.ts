import '../../src/css/theme1.scss';
import '../styles/demo-shell.scss';
import {signal} from 'alien-signals';
import {App, type BindingContext} from '../../src';
import {ensurePortableUiRootScope} from '../utils/ensurePortableUiRoot';
import {syncHeadStylesToShadowRoot} from '../utils/syncHeadStylesToShadowRoot';

ensurePortableUiRootScope();

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const app = new App(host, {
  id: 'imperative-demo',
  styleIsolation: {mode: 'shadow'},
  model: {
    profile: {
      name: 'Alice',
      city: 'Nanjing',
    },
    actions: {
      applyPreset: (ctx: BindingContext) => {
        ctx.set('profile.name', 'Charlie');
        ctx.set('profile.city', 'Hangzhou');
      },
    },
  },
  bindingOptions: {
    proxy: true,
    warn: true,
  },
});

if (app.shadowRoot) {
  syncHeadStylesToShadowRoot(app.shadowRoot);
}

app.root.classList.add('imperative-root');

const createCard = (title: string, description: string): {card: HTMLElement; body: HTMLElement} => {
  const card = document.createElement('section');
  card.className = 'demo-card imperative-card';

  const heading = document.createElement('div');
  heading.className = 'imperative-card-title';
  heading.textContent = title;

  const desc = document.createElement('p');
  desc.className = 'imperative-card-description';
  desc.textContent = description;

  const body = document.createElement('div');
  body.className = 'imperative-card-body';

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
hero.className = 'imperative-hero';
hero.innerHTML = `
  <div class="imperative-hero-copy">
    <h1>命令式接口示例</h1>
    <p>
      这个页面展示了 ` + "`App`" + ` 的自动生成 add.* 方法、嵌套 tab 作用域，以及如何把组件重新组织成更清晰的页面结构。
    </p>
  </div>
  <div class="imperative-hero-badges">
    <span class="imperative-badge">add.Button</span>
    <span class="imperative-badge">add.Input</span>
    <span class="imperative-badge">add.Select</span>
    <span class="imperative-badge">add.Checkbox</span>
    <span class="imperative-badge">add.Toast</span>
    <span class="imperative-badge">add.tab</span>
  </div>
`;

const layout = document.createElement('div');
layout.className = 'imperative-grid';

const formCard = createCard('表单控件', '把按钮、选择器和复选框整理成一列，适合做设置面板。');
const actionCard = createCard('动作与反馈', '把操作按钮和 Toast 放在一起，形成明确的反馈区。');
const tabCard = createCard('嵌套区域', '展示 `add.tab()` 创建的子作用域以及它内部的组件。');
const bindingCard = createCard('绑定演示', '展示路径绑定、signal 绑定和 proxy=true 的自动追踪。');

layout.append(formCard.card, actionCard.card, tabCard.card, bindingCard.card);
app.root.append(hero, layout);

const title = app.add.Label({id: 'title', text: '命令式接口示例'});
const theme = app.add.Select({
  id: 'theme',
  placeholder: '选择主题',
  options: [
    {label: '浅色', value: 'light'},
    {label: '深色', value: 'dark'},
  ],
});
const agree = app.add.Checkbox({id: 'agree', label: '我已阅读并同意'});
const toast = app.add.Toast({id: 'toast', visible: false, message: '准备就绪'});

const controls = document.createElement('div');
controls.className = 'demo-controls';

app.add.Button({
  id: 'show-toast',
  text: '显示提示',
  onClick: () => {
    toast.show(`已选择主题：${String(theme.getValue())}`, 'success');
  },
});

app.add.Button({
  id: 'show-agree',
  text: '查看勾选状态',
  onClick: () => {
    toast.show(agree.isChecked() ? '已勾选同意' : '尚未勾选同意', agree.isChecked() ? 'info' : 'warning');
  },
});

const tab = app.add.tab({id: 'settings-tab'});
tab.add.Button({id: 'tab-btn', text: 'Tab 内按钮'});
tab.add.Input({id: 'tab-input', placeholder: 'Tab 内输入框'});

const liveSignal = signal('Signal: ready');
const previewLabel = app.add.Label({
  id: 'bind-preview',
  text: '预览：Alice / Nanjing',
});
const nameInput = app.add.Input({
  id: 'bind-name',
  placeholder: '姓名（绑定 profile.name）',
  bind: {
    value: 'profile.name',
  },
  onInput: () => {
    previewLabel.setText(`预览：${nameInput.getValue()} / ${cityInput.getValue()}`);
  },
});
const cityInput = app.add.Input({
  id: 'bind-city',
  placeholder: '城市（绑定 profile.city）',
  bind: {
    value: 'profile.city',
  },
  onInput: () => {
    previewLabel.setText(`预览：${nameInput.getValue()} / ${cityInput.getValue()}`);
  },
});
const signalInput = app.add.Input({
  id: 'bind-signal',
  bind: {
    value: liveSignal,
  },
});

app.add.Button({
  id: 'bind-apply-preset',
  text: '应用预设（ctx.set）',
  bind: {
    onClick: 'actions.applyPreset',
  },
});

app.add.Button({
  id: 'bind-signal-next',
  text: '切换 signal 文本',
  onClick: () => {
    const nextText = liveSignal() === 'Signal: ready' ? 'Signal: updated' : 'Signal: ready';
    liveSignal(nextText);
    toast.show(nextText, 'info');
  },
});

app.add.Button({
  id: 'bind-model-direct-write',
  text: '直接写 model（proxy 自动刷新）',
  onClick: () => {
    const model = app.getModel<{profile: {name: string; city: string}}>();
    model.profile.name = `User-${Math.floor(Math.random() * 100)}`;
    model.profile.city = model.profile.city === 'Nanjing' ? 'Shanghai' : 'Nanjing';
    toast.show(`已更新为 ${model.profile.name} / ${model.profile.city}`, 'success');
  },
});

const hint = document.createElement('p');
hint.className = 'demo-feedback';
hint.textContent = '这个页面使用 `App` 命令式 API 创建。';

const formInfo = document.createElement('p');
formInfo.className = 'imperative-card-note';
formInfo.textContent = '这些组件都由同一个 `App` 实例管理。';
formCard.body.append(formInfo);

const actionToolbar = document.createElement('div');
actionToolbar.className = 'demo-controls imperative-toolbar';
actionToolbar.append(hint);
actionCard.body.append(actionToolbar);

const tabMount = document.createElement('div');
tabMount.className = 'imperative-tab-shell';
tabCard.body.append(tabMount);

const bindingInfo = document.createElement('p');
bindingInfo.className = 'imperative-card-note';
bindingInfo.textContent = '输入框与 model/signal 双向同步；下方实时预览会跟随 name/city 变化。';
bindingCard.body.append(bindingInfo);

appendById('title', formCard.body);
appendById('theme', formCard.body);
appendById('agree', formCard.body);

appendById('show-toast', actionToolbar);
appendById('show-agree', actionToolbar);
appendById('toast', actionCard.body);

appendById('settings-tab', tabMount);
appendById('tab-btn', tabMount);
appendById('tab-input', tabMount);

appendById('bind-name', bindingCard.body);
appendById('bind-city', bindingCard.body);
appendById('bind-preview', bindingCard.body);
appendById('bind-signal', bindingCard.body);
appendById('bind-apply-preset', bindingCard.body);
appendById('bind-signal-next', bindingCard.body);
appendById('bind-model-direct-write', bindingCard.body);

previewLabel.setText(`预览：${nameInput.getValue()} / ${cityInput.getValue()}`);

void title;
void nameInput;
void cityInput;
void signalInput;

