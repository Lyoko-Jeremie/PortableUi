/**
 * Group 分组容器组件测试
 */

import {Group} from '../../../src/components/container/Group';
import {Button} from '../../../src/components/basic/Button';

describe('Group', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('should create group element', () => {
    const group = new Group({id: 'test-group'});
    group.mount(container);

    const element = group.getElement();
    expect(element).toBeTruthy();
    expect(element?.className).toContain('portableui-group');
  });

  test('should render title', () => {
    const group = new Group({title: 'Group Title'});
    group.mount(container);

    const element = group.getElement();
    const titleElement = element?.querySelector('.portableui-group-title');
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toBe('Group Title');
  });

  test('should render without title', () => {
    const group = new Group();
    group.mount(container);

    const element = group.getElement();
    const titleElement = element?.querySelector('.portableui-group-title');
    expect(titleElement).toBeFalsy();
  });

  test('should have content container', () => {
    const group = new Group();
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content');
    expect(contentContainer).toBeTruthy();
  });

  test('should apply border by default', () => {
    const group = new Group();
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('border');
  });

  test('should support bordered option', () => {
    const group = new Group({bordered: false});
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).not.toContain('border: ');
  });

  test('should apply custom border styling', () => {
    const group = new Group({
      bordered: true,
      borderColor: '#ff0000',
      borderWidth: 2,
      borderStyle: 'dashed',
    });
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('2px');
    expect(styles).toContain('dashed');
    expect(styles).toContain('#ff0000');
  });

  test('should apply border radius', () => {
    const group = new Group({borderRadius: 8});
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('border-radius: 8px');
  });

  test('should apply backgroundColor', () => {
    const group = new Group({backgroundColor: '#f5f5f5'});
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('background-color: #f5f5f5');
  });

  test('should render children', () => {
    const button1 = new Button({text: 'Button 1'});
    const button2 = new Button({text: 'Button 2'});
    const group = new Group({
      title: 'Buttons',
      children: [button1, button2],
    });
    group.mount(container);

    const element = group.getElement();
    const buttons = element?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  test('should add children dynamically', () => {
    const group = new Group({title: 'Dynamic'});
    group.mount(container);

    const button = new Button({text: 'Added'});
    group.addChild(button);

    const children = group.getContainerChildren();
    expect(children.length).toBe(1);
  });

  test('should support imperative add* shortcuts', () => {
    const group = new Group({id: 'group-shortcut', title: 'Shortcut Group'});
    group.mount(container);

    const button = group.add.Button({id: 'group-btn', text: 'Group shortcut'});

    expect(button).toBeInstanceOf(Button);
    expect(group.getContainerChildren()).toContain(button);
    expect(group.getElement()?.querySelector('#group-btn')?.textContent).toBe('Group shortcut');
  });

  test('should apply title position top by default', () => {
    const group = new Group({title: 'Title'});
    group.mount(container);

    const element = group.getElement();
    const titleElement = element?.querySelector('.portableui-group-title') as HTMLElement;
    const styles = titleElement?.getAttribute('style') || '';
    expect(styles).toContain('margin-bottom');
  });

  test('should apply title position left', () => {
    const group = new Group({title: 'Title', titlePosition: 'left'});
    group.mount(container);

    const element = group.getElement();
    const titleElement = element?.querySelector('.portableui-group-title') as HTMLElement;
    const styles = titleElement?.getAttribute('style') || '';
    expect(styles).toContain('margin-right');
  });

  test('should apply direction vertical', () => {
    const group = new Group({direction: 'vertical'});
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('flex-direction: column');
  });

  test('should apply gap and padding', () => {
    const group = new Group({gap: 12, padding: 10});
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('gap: 12px');
    expect(styles).toContain('padding: 10px');
  });

  test('should apply height and minHeight', () => {
    const group = new Group({height: 200, minHeight: 100});
    group.mount(container);

    const element = group.getElement();
    const contentContainer = element?.querySelector('.portableui-group-content') as HTMLElement;
    const styles = contentContainer?.getAttribute('style') || '';
    expect(styles).toContain('height: 200px');
    expect(styles).toContain('min-height: 100px');
  });

  test('should unmount properly', () => {
    const group = new Group({title: 'Test'});
    group.mount(container);

    expect(group.isMounted()).toBe(true);
    group.unmount();
    expect(group.isMounted()).toBe(false);
  });

  test('should update and rerender', () => {
    const group = new Group({title: 'Original'});
    group.mount(container);

    group.update({title: 'Updated'});

    const element = group.getElement();
    const titleElement = element?.querySelector('.portableui-group-title');
    expect(titleElement?.textContent).toBe('Updated');
  });

  test('should support nested containers with add* shortcuts', () => {
    const group = new Group({id: 'group-shortcut', title: 'Outer Group'});
    group.mount(container);

    const innerGroup = group.add.Group({id: 'group-nested', title: 'Inner Group'}) as Group;
    const button = innerGroup.add.Button({id: 'group-nested-btn', text: 'Nested'});

    expect(innerGroup).toBeTruthy();
    expect(button).toBeInstanceOf(Button);
    expect(group.getContainerChildren()).toContain(innerGroup);
  });

  test('should support adding Container to Group', () => {
    const group = new Group({id: 'group-parent', title: 'Group'});
    group.mount(container);

    const containerChild = group.add.Container({id: 'container-child'});

    expect(containerChild).toBeTruthy();
    expect(group.getContainerChildren()).toContain(containerChild);
  });

  test('should support adding Flex to Group', () => {
    const group = new Group({id: 'group-parent', title: 'Group'});
    group.mount(container);

    const flex = group.add.Flex({id: 'flex-child', direction: 'vertical'});

    expect(flex).toBeTruthy();
    expect(group.getContainerChildren()).toContain(flex);
  });

  test('should support adding Grid to Group', () => {
    const group = new Group({id: 'group-parent', title: 'Group'});
    group.mount(container);

    const grid = group.add.Grid({id: 'grid-child', columns: 2});

    expect(grid).toBeTruthy();
    expect(group.getContainerChildren()).toContain(grid);
  });
});
