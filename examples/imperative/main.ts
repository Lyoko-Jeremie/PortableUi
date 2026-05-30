import '../styles/demo-base.css';
import './styles.css';
import {App} from '../../src';

const host = document.getElementById('app');
if (!host) {
  throw new Error('Missing #app');
}

const app = new App(host, {id: 'imperative-demo'});

const title = app.addLabel({id: 'title', text: '命令式接口示例'});
const theme = app.addSelect({
  id: 'theme',
  placeholder: '选择主题',
  options: [
    {label: '浅色', value: 'light'},
    {label: '深色', value: 'dark'},
  ],
});
const agree = app.addCheckbox({id: 'agree', label: '我已阅读并同意'});
const toast = app.addToast({id: 'toast', visible: false, message: '准备就绪'});

const controls = document.createElement('div');
controls.className = 'demo-controls';

app.addButton({
  id: 'show-toast',
  text: '显示提示',
  onClick: () => {
    toast.show(`已选择主题：${String(theme.getValue())}`, 'success');
  },
});

app.addButton({
  id: 'show-agree',
  text: '查看勾选状态',
  onClick: () => {
    toast.show(agree.isChecked() ? '已勾选同意' : '尚未勾选同意', agree.isChecked() ? 'info' : 'warning');
  },
});

const tab = app.addTab({id: 'settings-tab'});
tab.addButton({id: 'tab-btn', text: 'Tab 内按钮'});
tab.addInput({id: 'tab-input', placeholder: 'Tab 内输入框'});

const hint = document.createElement('p');
hint.className = 'demo-feedback';
hint.textContent = '这个页面使用 `App` 命令式 API 创建。';

controls.appendChild(hint);
host.appendChild(controls);

void title;

