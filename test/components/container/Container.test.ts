/**
 * Container 容器组件测试
 */

import {Container} from '../../../src/components/container/Container';
import {Button} from '../../../src/components/basic/Button';

describe('Container', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('should create container element', () => {
    const comp = new Container({id: 'test-container'});
    comp.mount(container);

    const element = comp.getElement();
    expect(element).toBeTruthy();
    expect(element?.className).toContain('portableui-container');
    expect(element?.id).toBe('test-container');
  });

  test('should apply horizontal layout by default', () => {
    const comp = new Container({direction: 'horizontal'});
    comp.mount(container);

    const element = comp.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('flex-direction: row');
    expect(styles).toContain('display: flex');
  });

  test('should apply vertical layout', () => {
    const comp = new Container({direction: 'vertical'});
    comp.mount(container);

    const element = comp.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('flex-direction: column');
  });

  test('should apply gap, padding and alignment', () => {
    const comp = new Container({
      gap: 10,
      padding: 5,
      justifyContent: 'center',
      alignItems: 'center',
    });
    comp.mount(container);

    const element = comp.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('gap: 10px');
    expect(styles).toContain('padding: 5px');
    expect(styles).toContain('justify-content: center');
    expect(styles).toContain('align-items: center');
  });

  test('should apply background color', () => {
    const comp = new Container({backgroundColor: '#fff'});
    comp.mount(container);

    const element = comp.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('background-color: #fff');
  });

  test('should apply width and height', () => {
    const comp = new Container({width: 200, height: 100});
    comp.mount(container);

    const element = comp.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('width: 200px');
    expect(styles).toContain('height: 100px');
  });

  test('should add child components', () => {
    const button = new Button({text: 'Test'});
    const comp = new Container({
      children: [button],
    });
    comp.mount(container);

    const element = comp.getElement();
    const buttons = element?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  test('should add container child dynamically', () => {
    const comp = new Container({id: 'parent'});
    comp.mount(container);

    const button = new Button({text: 'Added'});
    comp.addChild(button);

    const element = comp.getElement();
    const buttons = element?.querySelectorAll('button');
    expect(buttons?.length).toBeGreaterThan(0);
  });

  test('should remove container child', () => {
    const button = new Button({text: 'Remove me'});
    const comp = new Container({children: [button]});
    comp.mount(container);

    comp.removeContainerChild(button);

    const children = comp.getContainerChildren();
    expect(children.length).toBe(0);
  });

  test('should clear all children', () => {
    const button1 = new Button({text: 'Button 1'});
    const button2 = new Button({text: 'Button 2'});
    const comp = new Container({children: [button1, button2]});
    comp.mount(container);

    comp.clearChildren();

    const children = comp.getContainerChildren();
    expect(children.length).toBe(0);
  });

  test('should set children', () => {
    const comp = new Container();
    comp.mount(container);

    const button1 = new Button({text: 'New 1'});
    const button2 = new Button({text: 'New 2'});
    comp.setChildren([button1, button2]);

    const children = comp.getContainerChildren();
    expect(children.length).toBe(2);
  });

  test('should support wrap property', () => {
    const comp = new Container({wrap: true});
    comp.mount(container);

    const element = comp.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('flex-wrap: wrap');
  });

  test('should unmount properly', () => {
    const comp = new Container({id: 'unmount-test'});
    comp.mount(container);

    expect(comp.isMounted()).toBe(true);
    comp.unmount();
    expect(comp.isMounted()).toBe(false);
  });
});


