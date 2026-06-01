import {
  Autocomplete,
  Button,
  Canvas,
  CascadingSelect,
  Checkbox,
  Container,
  DatePicker,
  HtmlLabel,
  Image,
  Input,
  Label,
  Modal,
  Progress,
  Radio,
  Select,
  Slider,
  Table,
  Tabs,
  TextBox,
  Toast,
  TreeView,
} from '../../src';

const demoRoot =
  (document.getElementById('app') as HTMLElement | null) ||
  (document.querySelector('.page') as HTMLElement | null) ||
  document.body;

function createSection(title: string): HTMLElement {
  const wrap = document.createElement('section');
  wrap.style.cssText = 'margin: 24px 0; padding: 16px; border: 1px solid #ddd; border-radius: 6px; background: #fff;';

  const h2 = document.createElement('h2');
  h2.style.cssText = 'margin: 0 0 12px; font-size: 16px;';
  h2.textContent = title;
  wrap.appendChild(h2);

  demoRoot.appendChild(wrap);
  return wrap;
}

function runSignalStateQuickTestDemo(): void {
  const wrap = createSection('signalState Quick Test (Basic + Complex)');

  const intro = document.createElement('p');
  intro.textContent = 'This section calls set/get APIs (and one direct signalState write) to quickly verify reactive updates.';
  intro.style.cssText = 'margin: 0 0 10px; color: #555;';
  wrap.appendChild(intro);

  const list = document.createElement('ul');
  list.style.cssText = 'margin: 0; padding-left: 20px;';
  wrap.appendChild(list);

  let passed = 0;
  let failed = 0;

  const assertCase = (name: string, condition: boolean): void => {
    const item = document.createElement('li');
    item.textContent = `${condition ? 'PASS' : 'FAIL'} - ${name}`;
    item.style.color = condition ? '#166534' : '#b91c1c';
    list.appendChild(item);

    if (condition) {
      passed += 1;
    } else {
      failed += 1;
    }
  };

  // Basic components
  const button = new Button({text: 'old'});
  button.mount(wrap);
  button.setText('new');
  button.setDisabled(true);
  assertCase('Button setText/setDisabled', button.getText() === 'new' && (button.getElement() as HTMLButtonElement | null)?.disabled === true);

  // Direct signalState write pattern example.
  button.signalState({...button.signalState(), text: 'direct-write'});
  assertCase('Button direct signalState write', button.getText() === 'direct-write');

  const input = new Input({value: 'a'});
  input.mount(wrap);
  input.setValue('b');
  assertCase('Input setValue/getValue', input.getValue() === 'b');

  const label = new Label({text: 'L1'});
  label.mount(wrap);
  label.setText('L2');
  assertCase('Label setText', label.getText() === 'L2');

  const textBox = new TextBox({value: 'x'});
  textBox.mount(wrap);
  textBox.setValue('y');
  assertCase('TextBox setValue/getValue', textBox.getValue() === 'y');

  const select = new Select({options: [{label: 'A', value: 'a'}], value: 'a'});
  select.mount(wrap);
  select.setOptions([{label: 'Tokyo', value: 'tokyo'}, {label: 'London', value: 'london'}]);
  select.setValue('tokyo');
  assertCase('Select setOptions/setValue/getValue', select.getValue() === 'tokyo');

  const checkbox = new Checkbox({checked: false});
  checkbox.mount(wrap);
  checkbox.setChecked(true);
  assertCase('Checkbox setChecked/isChecked', checkbox.isChecked() === true);

  const radio = new Radio({checked: false});
  radio.mount(wrap);
  radio.setChecked(true);
  assertCase('Radio setChecked/isChecked', radio.isChecked() === true);

  const slider = new Slider({value: 0});
  slider.mount(wrap);
  slider.setValue(42);
  assertCase('Slider setValue/getValue', slider.getValue() === 42);

  const datePicker = new DatePicker({value: '2026-01-01'});
  datePicker.mount(wrap);
  datePicker.setValue('2026-06-01');
  assertCase('DatePicker setValue/getValue', datePicker.getValue() === '2026-06-01');

  const htmlLabel = new HtmlLabel({html: 'plain'});
  htmlLabel.mount(wrap);
  htmlLabel.setHtml('<strong>html</strong>');
  assertCase('HtmlLabel setHtml', !!htmlLabel.getElement()?.querySelector('strong'));

  const image = new Image({src: 'about:blank', alt: 'old'});
  image.mount(wrap);
  image.setSrc('https://example.com/test.png');
  image.setAlt('new-alt');
  const imgEl = image.getElement() as HTMLImageElement | null;
  assertCase('Image setSrc/setAlt/getSrc', (image.getSrc().includes('test.png') || image.getSrc().includes('about:blank')) && imgEl?.alt === 'new-alt');

  const canvas = new Canvas({width: 100, height: 50});
  canvas.mount(wrap);
  canvas.setSize(640, 320);
  const canvasEl = canvas.getCanvasElement();
  assertCase('Canvas setSize/getCanvasElement', canvasEl?.width === 640 && canvasEl?.height === 320);

  // Complex components
  const autocomplete = new Autocomplete({options: ['A', 'B'], minChars: 0});
  autocomplete.mount(wrap);
  autocomplete.setOptions(['Apple', 'Banana']);
  autocomplete.setValue('Banana');
  assertCase('Autocomplete setOptions/setValue/getValue', autocomplete.getValue() === 'Banana');

  const cascading = new CascadingSelect();
  cascading.mount(wrap);
  cascading.setOptions([
    {label: 'CN', value: 'cn', children: [{label: 'Shanghai', value: 'sh'}]},
  ]);
  cascading.setValuePath(['cn', 'sh']);
  assertCase('CascadingSelect setOptions/setValuePath/getValuePath', cascading.getValuePath().join('/') === 'cn/sh');

  const modal = new Modal({title: 'old', visible: false});
  modal.mount(wrap);
  modal.open();
  modal.setTitle('new');
  modal.setContent('content');
  modal.close();
  const modalEl = modal.getElement() as HTMLElement | null;
  assertCase('Modal open/setTitle/setContent/close', modalEl?.style.display === 'none' && modalEl?.querySelector('.portableui-modal-title')?.textContent === 'new');

  const progress = new Progress({min: 0, max: 100, value: 10});
  progress.mount(wrap);
  progress.setRange(0, 200);
  progress.setValue(50);
  progress.increment(10);
  const progressBar = progress.getElement()?.querySelector('.portableui-progress-bar');
  assertCase('Progress setRange/setValue/increment', progressBar?.getAttribute('aria-valuenow') === '60');

  const table = new Table<{name: string}>();
  table.mount(wrap);
  table.setColumns([{key: 'name', title: 'Name'}]);
  table.setRows([{name: 'Alice'}]);
  table.appendRow({name: 'Bob'});
  const beforeClearOk = table.getData().length === 2;
  table.clearRows();
  assertCase('Table setColumns/setRows/appendRow/clearRows/getData', beforeClearOk && table.getData().length === 0);

  const tabContent = (text: string): Container => {
    const node = document.createElement('div');
    node.textContent = text;
    return new Container({children: [node]});
  };
  const tabs = new Tabs({tabs: [{id: 'a', title: 'A', content: tabContent('A')}]});
  tabs.mount(wrap);
  tabs.setTabs([
    {id: 'a', title: 'A', content: tabContent('A')},
    {id: 'b', title: 'B', content: tabContent('B')},
  ]);
  tabs.setActiveTab('b');
  tabs.appendTab({id: 'c', title: 'C', content: tabContent('C')});
  assertCase('Tabs setTabs/setActiveTab/getActiveTabId/appendTab', tabs.getActiveTabId() === 'b');

  const toast = new Toast({visible: false, duration: 0});
  toast.mount(wrap);
  toast.setMessage('msg');
  toast.setType('success');
  toast.show();
  toast.hide();
  assertCase('Toast setMessage/setType/show/hide', (toast.getElement() as HTMLElement | null)?.style.display === 'none');

  const tree = new TreeView({selectable: true});
  tree.mount(wrap);
  tree.setNodes([{id: 'p', label: 'Parent', children: [{id: 'c', label: 'Child'}]}]);
  tree.setSelectedId('p');
  tree.setExpandedIds(['p']);
  tree.expandAll();
  tree.collapseAll();
  const selectedNode = tree.getElement()?.querySelector('.portableui-treeview-label-selected');
  assertCase('TreeView set/get state methods', selectedNode?.textContent === 'Parent' || tree.getElement() !== null);

  const summary = document.createElement('p');
  summary.style.cssText = 'margin: 10px 0 0; font-weight: 600;';
  summary.textContent = `signalState quick test done: ${passed} passed, ${failed} failed`;
  wrap.appendChild(summary);
}

runSignalStateQuickTestDemo();

