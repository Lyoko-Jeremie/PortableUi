/**
 * Flex 弹性布局组件测试
 */

import {Flex} from '../../../src/components/container/Flex';
import {Button} from '../../../src/components/basic/Button';

describe('Flex', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('should create flex element', () => {
    const flex = new Flex({id: 'flex-container'});
    flex.mount(container);

    const element = flex.getElement();
    expect(element).toBeTruthy();
    expect(element?.className).toContain('portableui-flex');
  });

  test('should apply horizontal layout by default', () => {
    const flex = new Flex();
    flex.mount(container);

    const element = flex.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('display: flex');
    expect(styles).toContain('flex-direction: row');
  });

  test('should apply vertical layout', () => {
    const flex = new Flex({direction: 'vertical'});
    flex.mount(container);

    const element = flex.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('flex-direction: column');
  });

  test('should apply flex grow, shrink and basis', () => {
    const flex = new Flex({grow: 2, shrink: 1, basis: '100px'});
    flex.mount(container);

    const element = flex.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('flex: 2');
    expect(styles).toContain('1');
    expect(styles).toContain('100px');
  });

  test('should apply gap and justifyContent', () => {
    const flex = new Flex({gap: 15, justifyContent: 'space-between'});
    flex.mount(container);

    const element = flex.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('gap: 15px');
    expect(styles).toContain('justify-content: space-between');
  });

  test('should render children', () => {
    const button1 = new Button({text: 'Button 1'});
    const button2 = new Button({text: 'Button 2'});
    const flex = new Flex({children: [button1, button2]});
    flex.mount(container);

    const element = flex.getElement();
    const buttons = element?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  test('should add children dynamically', () => {
    const flex = new Flex();
    flex.mount(container);

    const button = new Button({text: 'Added'});
    flex.addChild(button);

    const children = flex.getContainerChildren();
    expect(children.length).toBe(1);
  });

  test('should apply default flex values', () => {
    const flex = new Flex();
    flex.mount(container);

    const element = flex.getElement();
    const styles = element?.getAttribute('style') || '';
    // Default grow is 1
    expect(styles).toContain('flex: 1');
  });

  test('should unmount properly', () => {
    const flex = new Flex();
    flex.mount(container);

    expect(flex.isMounted()).toBe(true);
    flex.unmount();
    expect(flex.isMounted()).toBe(false);
  });

  test('should update on rerend', () => {
    const flex = new Flex({gap: 10});
    flex.mount(container);

    flex.update({gap: 20});

    const element = flex.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('gap: 20px');
  });
});


