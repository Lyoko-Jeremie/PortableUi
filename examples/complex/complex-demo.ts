/**
 * Phase 5 复杂组件示例。
 *
 * 包含：
 * - Table
 * - TreeView
 * - Tabs
 * - Modal
 * - Toast
 * - Progress
 * - Autocomplete
 * - CascadingSelect
 */

import {Button} from '../../src/components/basic';
import {Container} from '../../src/components/container';
import {
  Autocomplete,
  CascadingOption,
  CascadingSelect,
  Modal,
  Progress,
  Table,
  TableColumn,
  Tabs,
  Toast,
  TreeNode,
  TreeView,
} from '../../src/components/complex';

interface UserRow {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Pending' | 'Blocked';
}

function createCard(title: string, description: string): {root: HTMLElement; mountPoint: HTMLElement} {
  const root = document.createElement('section');
  root.className = 'demo-card';

  const heading = document.createElement('h2');
  heading.className = 'demo-title';
  heading.textContent = title;

  const desc = document.createElement('p');
  desc.className = 'demo-description';
  desc.textContent = description;

  const mountPoint = document.createElement('div');
  mountPoint.className = 'demo-mount';

  root.appendChild(heading);
  root.appendChild(desc);
  root.appendChild(mountPoint);

  return {root, mountPoint};
}

export function tableExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '1. Table 表格',
    '演示带自定义列渲染、斑马纹和行点击事件的数据表格。'
  );

  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '点击任意行以查看用户信息。';

  const columns: TableColumn<UserRow>[] = [
    {key: 'id', title: '编号', width: 70, align: 'center'},
    {key: 'name', title: '姓名', width: 170},
    {key: 'email', title: '邮箱'},
    {
      key: 'status',
      title: '状态',
      width: 120,
      align: 'center',
      render: (value) => {
        const badge = document.createElement('span');
        const status = String(value ?? '');
        badge.textContent = status;
        badge.className = `status status-${status.toLowerCase()}`;
        return badge;
      },
    },
  ];

  const initialRows: UserRow[] = [
    {id: 1, name: 'Alice', email: 'alice@demo.local', status: 'Active'},
    {id: 2, name: 'Bob', email: 'bob@demo.local', status: 'Pending'},
    {id: 3, name: 'Chris', email: 'chris@demo.local', status: 'Blocked'},
  ];

  const table = new Table<UserRow>({
    columns,
    data: initialRows,
    striped: true,
    hoverable: true,
    onRowClick: (_self, _event, row) => {
      feedback.textContent = `当前选择：#${row.id} ${row.name}（${row.status}）`;
    },
  });

  table.mount(mountPoint);

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  const addRow = new Button({
    text: '追加一行',
    onClick: () => {
      const nextId = table.getData().length + 1;
      table.appendRow({
        id: nextId,
        name: `用户 ${nextId}`,
        email: `user${nextId}@demo.local`,
        status: nextId % 2 === 0 ? 'Active' : 'Pending',
      });
    },
  });

  const clearRows = new Button({
    text: '清空数据',
    onClick: () => table.clearRows(),
  });

  addRow.mount(controls);
  clearRows.mount(controls);

  root.appendChild(controls);
  root.appendChild(feedback);
  return root;
}

export function treeViewExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '2. TreeView 树形视图',
    '演示可展开、可折叠并支持节点选择的树结构。'
  );

  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '请从树中选择一个节点。';

  const nodes: TreeNode[] = [
    {
      id: 'project',
      label: '项目',
      children: [
        {
          id: 'src',
          label: 'src',
          children: [
            {id: 'components', label: 'components 组件'},
            {id: 'layout', label: 'layout 布局'},
            {id: 'styles', label: 'styles 样式'},
          ],
        },
        {
          id: 'test',
          label: 'test',
          children: [{id: 'unit', label: 'unit 单元测试'}, {id: 'integration', label: 'integration 集成测试'}],
        },
      ],
    },
  ];

  const tree = new TreeView({
    nodes,
    expandedIds: ['project', 'src'],
    onSelect: (_self, _event, node) => {
      feedback.textContent = `已选择节点：${node.label}（${node.id}）`;
    },
  });
  tree.mount(mountPoint);

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  new Button({text: '全部展开', onClick: () => tree.expandAll()}).mount(controls);
  new Button({text: '全部折叠', onClick: () => tree.collapseAll()}).mount(controls);

  root.appendChild(controls);
  root.appendChild(feedback);
  return root;
}

export function tabsExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '3. Tabs 标签页',
    '演示标签页切换，以及使用 Container 组织标签页内容。'
  );

  const info = document.createElement('p');
  info.className = 'demo-feedback';
  info.textContent = '当前标签页：概览';

  const tabs = new Tabs({
    stretch: true,
    tabs: [
      {
        id: 'overview',
        title: '概览',
        content: new Container({
          children: [Object.assign(document.createElement('p'), {
            textContent: 'PortableUi 提供适用于脚本环境和 Web 应用的可组合组件。',
          })],
        }),
      },
      {
        id: 'stats',
        title: '统计',
        content: new Container({
          children: [Object.assign(document.createElement('div'), {
            innerHTML: '<strong>本周使用增长：</strong> +23%',
          })],
        }),
      },
      {
        id: 'settings',
        title: '设置',
        content: new Container({
          children: [Object.assign(document.createElement('p'), {
            textContent: '可以在同一处统一调整行为、主题和国际化配置。',
          })],
        }),
      },
    ],
    onTabChange: (_self, _event, tab) => {
      info.textContent = `当前标签页：${tab.title}`;
    },
  });

  tabs.mount(mountPoint);
  root.appendChild(info);
  return root;
}

export function modalAndToastExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '4. Modal + Toast 模态框与消息提示',
    '演示带确认/取消逻辑的模态框，以及不同类型的 Toast 消息提示。'
  );

  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '点击按钮打开模态框并触发相关事件。';

  const toast = new Toast({
    visible: false,
    message: '已准备就绪',
    type: 'info',
    duration: 2000,
  });

  const modalBody = document.createElement('div');
  modalBody.textContent = '是否保存当前配置？';

  const modal = new Modal({
    title: '保存变更',
    content: modalBody,
    visible: false,
    onOpen: () => {
      feedback.textContent = '模态框已打开。';
    },
    onClose: () => {
      feedback.textContent = '模态框已关闭。';
    },
    onConfirm: () => {
      toast.show('保存成功', 'success');
      modal.close();
    },
    onCancel: () => {
      toast.show('操作已取消', 'warning');
    },
  });

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  new Button({text: '打开模态框', onClick: () => modal.open()}).mount(controls);
  new Button({text: '信息提示', onClick: () => toast.show('后台同步已完成', 'info')}).mount(controls);
  new Button({text: '错误提示', onClick: () => toast.show('网络请求失败', 'error')}).mount(controls);

  controls.appendChild(feedback);

  modal.mount(mountPoint);
  toast.mount(mountPoint);
  root.appendChild(controls);
  return root;
}

export function progressExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '5. Progress 进度条',
    '演示可递增更新的确定型进度条。'
  );

  const progress = new Progress({
    value: 25,
    color: '#4f46e5',
    labelFormatter: (value, _min, max) => `${value}/${max}`,
  });
  progress.mount(mountPoint);

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  new Button({text: '增加 10', onClick: () => progress.increment(10)}).mount(controls);
  new Button({text: '重置', onClick: () => progress.setValue(0)}).mount(controls);
  new Button({text: '完成', onClick: () => progress.setValue(100)}).mount(controls);

  root.appendChild(controls);
  return root;
}

export function autocompleteExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '6. Autocomplete 自动完成',
    '演示从预设选项中搜索并选择结果。'
  );

  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '可以尝试输入：re、ta 或 tr。';

  const autocomplete = new Autocomplete({
    placeholder: '搜索命令...',
    options: [
      'restart-service',
      'reload-cache',
      'trace-request',
      'tail-logs',
      'trigger-build',
      'rollback-release',
    ],
    onSelect: (_self, _event, option) => {
      feedback.textContent = `已选择：${option.value}`;
    },
  });

  autocomplete.mount(mountPoint);
  root.appendChild(feedback);
  return root;
}

export function cascadingSelectExample(): HTMLElement {
  const {root, mountPoint} = createCard(
    '7. CascadingSelect 级联选择',
    '演示多级联动下拉框，每一级选项都依赖上一级选择。'
  );

  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '当前路径：（未选择）';

  const options: CascadingOption[] = [
    {
      label: 'Asia',
      value: 'asia',
      children: [
        {
          label: '中国',
          value: 'china',
          children: [
            {label: '上海', value: 'shanghai'},
            {label: '深圳', value: 'shenzhen'},
          ],
        },
        {
          label: '日本',
          value: 'japan',
          children: [
            {label: '东京', value: 'tokyo'},
            {label: '大阪', value: 'osaka'},
          ],
        },
      ],
    },
    {
      label: '欧洲',
      value: 'europe',
      children: [
        {
          label: '德国',
          value: 'germany',
          children: [
            {label: '柏林', value: 'berlin'},
            {label: '慕尼黑', value: 'munich'},
          ],
        },
      ],
    },
  ];

  const select = new CascadingSelect({
    options,
    placeholder: '请选择',
    onChange: (_self, _event, valuePath) => {
      feedback.textContent = `当前路径：${valuePath.join(' / ') || '（未选择）'}`;
    },
  });

  select.mount(mountPoint);
  root.appendChild(feedback);
  return root;
}

export function mountAllComplexExamples(container: HTMLElement): void {
  const examples = [
    tableExample(),
    treeViewExample(),
    tabsExample(),
    modalAndToastExample(),
    progressExample(),
    autocompleteExample(),
    cascadingSelectExample(),
  ];

  examples.forEach((exampleRoot) => container.appendChild(exampleRoot));
}
