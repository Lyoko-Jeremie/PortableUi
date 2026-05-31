import {Button} from '../../src/components/basic';
import {Container} from '../../src/components/container';
import {TabItem, Tabs} from '../../src/components/complex';

function buildTabContent(title: string, description: string): Container {
  const wrap = document.createElement('div');

  const heading = document.createElement('h3');
  heading.className = 'tabs-panel-title';
  heading.textContent = title;

  const body = document.createElement('p');
  body.className = 'tabs-panel-body';
  body.textContent = description;

  wrap.appendChild(heading);
  wrap.appendChild(body);
  return new Container({children: [wrap]});
}

export function mountTabsExample(container: HTMLElement): void {
  const card = document.createElement('section');
  card.className = 'demo-card tabs-demo-card';

  const title = document.createElement('h1');
  title.className = 'demo-title';
  title.textContent = 'PortableUi - Tabs Demo';

  const intro = document.createElement('p');
  intro.className = 'demo-intro';
  intro.textContent = '测试 Tabs 的切换、禁用页签、动态切换和运行时更新。';

  const mountPoint = document.createElement('div');
  const feedback = document.createElement('p');
  feedback.className = 'demo-feedback';
  feedback.textContent = '当前激活页签：overview';

  const tabsData: TabItem[] = [
    {
      id: 'overview',
      title: '概览',
      content: buildTabContent('概览', '这是默认页签，展示基础内容。'),
    },
    {
      id: 'metrics',
      title: '指标',
      content: buildTabContent('指标', `这是容器内容渲染，生成时间：${new Date().toLocaleString()}`),
    },
    {
      id: 'roadmap',
      title: '路线图',
      content: buildTabContent('路线图', '这个页签展示容器内容。'),
    },
    {
      id: 'blocked',
      title: '禁用项',
      content: buildTabContent('禁用项', '你不应看到这个内容。'),
      disabled: true,
    },
  ];

  const tabs = new Tabs({
    stretch: true,
    tabs: tabsData,
    activeTabId: 'overview',
    onTabChange: (_self, _event, tab) => {
      feedback.textContent = `当前激活页签：${tab.id}`;
    },
  });

  tabs.mount(mountPoint);

  const controls = document.createElement('div');
  controls.className = 'demo-controls';

  new Button({text: '切换到指标', onClick: () => tabs.setActiveTab('metrics')}).mount(controls);
  new Button({text: '切换到路线图', onClick: () => tabs.setActiveTab('roadmap')}).mount(controls);
  new Button({text: '追加 Help 页签', onClick: () => {
    const nextTabs = [...tabsData, {
      id: 'help',
      title: '帮助',
      content: buildTabContent('帮助', '这个页签通过 setTabs 动态添加。'),
    }];
    tabs.setTabs(nextTabs);
    feedback.textContent = `当前激活页签：${tabs.getActiveTabId()}`;
  }}).mount(controls);

  card.appendChild(title);
  card.appendChild(intro);
  card.appendChild(mountPoint);
  card.appendChild(controls);
  card.appendChild(feedback);

  container.appendChild(card);
}

