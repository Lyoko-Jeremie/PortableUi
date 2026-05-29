/**
 * 布局系统示例
 * 演示 Container、Flex、Grid 和 Group 的使用
 */

import {Container, Flex, Grid, Group} from '../../src/layout';
import {Button, Input, Label} from '../../src/components/basic';

/**
 * 示例 1: 基础容器布局
 */
export function basicContainerExample(): HTMLElement {
  const container = document.createElement('div');

  const layoutContainer = new Container({
    direction: 'horizontal',
    gap: 10,
    padding: 15,
    backgroundColor: '#f5f5f5',
    width: '100%',
    id: 'basic-layout',
  });

  // 添加按钮
  const btn1 = new Button({text: 'Button 1'});
  const btn2 = new Button({text: 'Button 2'});
  const btn3 = new Button({text: 'Button 3'});

  layoutContainer.addChild(btn1);
  layoutContainer.addChild(btn2);
  layoutContainer.addChild(btn3);

  layoutContainer.mount(container);
  return container;
}

/**
 * 示例 2: 弹性布局
 */
export function flexLayoutExample(): HTMLElement {
  const container = document.createElement('div');

  const flexContainer = new Flex({
    direction: 'horizontal',
    gap: 15,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    width: '100%',
    id: 'flex-layout',
  });

  // 添加伸缩不同的元素
  const flex1 = new Flex({
    grow: 1,
    basis: '0',
    backgroundColor: '#ff9999',
    padding: 10,
    children: [new Label({text: 'Flex 1'})],
  });

  const flex2 = new Flex({
    grow: 2,
    basis: '0',
    backgroundColor: '#99ff99',
    padding: 10,
    children: [new Label({text: 'Flex 2 (2x)'})],
  });

  const flex3 = new Flex({
    grow: 1,
    basis: '0',
    backgroundColor: '#9999ff',
    padding: 10,
    children: [new Label({text: 'Flex 3'})],
  });

  flexContainer.addChild(flex1);
  flexContainer.addChild(flex2);
  flexContainer.addChild(flex3);

  flexContainer.mount(container);
  return container;
}

/**
 * 示例 3: 网格布局
 */
export function gridLayoutExample(): HTMLElement {
  const container = document.createElement('div');

  const gridContainer = new Grid({
    columns: 3,
    gap: 15,
    padding: 20,
    backgroundColor: '#f9f9f9',
    width: '100%',
    id: 'grid-layout',
  });

  // 添加网格项目
  for (let i = 1; i <= 9; i++) {
    const label = new Label({
      text: `Grid Item ${i}`,
      style: {
        backgroundColor: `hsl(${i * 40}, 70%, 70%)`,
        padding: '15px',
        textAlign: 'center',
      },
    });

    const item = Grid.createItem(i === 1 ? {
      columnSpan: 2, // 第一项跨 2 列
      children: [label],
    } : {
      children: [label],
    });

    gridContainer.addChild(item);
  }

  gridContainer.mount(container);
  return container;
}

/**
 * 示例 4: 分组布局
 */
export function groupLayoutExample(): HTMLElement {
  const container = document.createElement('div');

  const mainGroup = new Group({
    title: 'User Information',
    direction: 'vertical',
    gap: 12,
    padding: 15,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '100%',
  });

  // 创建子分组
  const nameGroup = new Group({
    title: 'Name',
    direction: 'horizontal',
    gap: 10,
    padding: 10,
    bordered: true,
    borderColor: '#eee',
  });

  const firstNameInput = new Input({
    placeholder: 'First Name',
    style: {flex: '1'},
  });
  const lastNameInput = new Input({
    placeholder: 'Last Name',
    style: {flex: '1'},
  });

  nameGroup.addChild(firstNameInput);
  nameGroup.addChild(lastNameInput);

  // 创建按钮组
  const buttonGroup = new Group({
    title: 'Actions',
    direction: 'horizontal',
    gap: 10,
    padding: 10,
    bordered: false,
  });

  const submitBtn = new Button({text: 'Submit'});
  const resetBtn = new Button({text: 'Reset'});
  const cancelBtn = new Button({text: 'Cancel'});

  buttonGroup.addChild(submitBtn);
  buttonGroup.addChild(resetBtn);
  buttonGroup.addChild(cancelBtn);

  mainGroup.addChild(nameGroup);
  mainGroup.addChild(buttonGroup);

  mainGroup.mount(container);
  return container;
}

/**
 * 示例 5: 复杂嵌套布局
 */
export function complexNestedLayoutExample(): HTMLElement {
  const container = document.createElement('div');

  const mainContainer = new Container({
    direction: 'vertical',
    gap: 15,
    padding: 20,
    backgroundColor: '#f0f0f0',
    width: '100%',
  });

  // 头部区域 - Flex 布局
  const headerFlex = new Flex({
    direction: 'horizontal',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 4,
    children: [new Label({text: 'Header'})],
  });

  // 内容区域 - Grid 布局
  const contentGrid = new Grid({
    columns: 2,
    gap: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 4,
  });

  // 左侧面板 - 分组
  const leftPanel = new Group({
    title: 'Left Panel',
    direction: 'vertical',
    gap: 10,
    padding: 15,
    borderColor: '#ddd',
  });

  const btn1 = new Button({text: 'Action 1'});
  const btn2 = new Button({text: 'Action 2'});
  leftPanel.addChild(btn1);
  leftPanel.addChild(btn2);

  // 右侧面板 - 分组
  const rightPanel = new Group({
    title: 'Right Panel',
    direction: 'vertical',
    gap: 10,
    padding: 15,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  });

  const input1 = new Input({placeholder: 'Input 1'});
  const input2 = new Input({placeholder: 'Input 2'});
  rightPanel.addChild(input1);
  rightPanel.addChild(input2);

  contentGrid.addChild(leftPanel);
  contentGrid.addChild(rightPanel);

  // 底部区域
  const footer = new Container({
    direction: 'horizontal',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 4,
  });

  const footerBtn1 = new Button({text: 'Save'});
  const footerBtn2 = new Button({text: 'Cancel'});
  footer.addChild(footerBtn1);
  footer.addChild(footerBtn2);

  mainContainer.addChild(headerFlex);
  mainContainer.addChild(contentGrid);
  mainContainer.addChild(footer);

  mainContainer.mount(container);
  return container;
}

/**
 * 示例 6: 响应式布局模拟
 */
export function responsiveLayoutExample(): HTMLElement {
  const container = document.createElement('div');

  const responsiveContainer = new Container({
    direction: 'horizontal',
    wrap: true,
    gap: 15,
    padding: 20,
    backgroundColor: '#f5f5f5',
    width: 'min(1200px, 100%)',
  });

  // 3 个等宽的卡片
  for (let i = 1; i <= 3; i++) {
    const card = new Group({
      title: `Card ${i}`,
      direction: 'vertical',
      gap: 10,
      padding: 15,
      backgroundColor: '#fff',
      width: 'calc(33.333% - 10px)',
      borderColor: '#ddd',
    });

    const cardContent = new Label({text: `This is card ${i} content`});
    const cardBtn = new Button({text: 'Learn More'});

    card.addChild(cardContent);
    card.addChild(cardBtn);

    responsiveContainer.addChild(card);
  }

  responsiveContainer.mount(container);
  return container;
}

