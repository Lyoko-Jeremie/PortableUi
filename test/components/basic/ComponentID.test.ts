/**
 * 组件ID功能测试
 */

import {Button} from '../../../src/components/basic/Button';
import {Input} from '../../../src/components/basic/Input';
import {Container} from '../../../src/components/container/Container';
import {BaseComponent} from '../../../src/core/BaseComponent';

describe('Component ID System', () => {
  let rootA: HTMLElement;
  let rootB: HTMLElement;

  beforeEach(() => {
    rootA = document.createElement('div');
    rootB = document.createElement('div');
    document.body.appendChild(rootA);
    document.body.appendChild(rootB);
  });

  afterEach(() => {
    rootA.remove();
    rootB.remove();
  });

  test('should auto-generate ID when not provided', () => {
    const button = new Button({text: 'Test'});
    const id = button.getId();

    expect(id).toBeTruthy();
    expect(id).toMatch(/^Button_[a-z0-9]+$/);
  });

  test('should use provided ID', () => {
    const customId = 'my-button';
    const button = new Button({id: customId, text: 'Test'});

    expect(button.getId()).toBe(customId);
  });

  test('should query component by ID in a specific container', () => {
    const button = new Button({text: 'Test'});
    button.mount(rootA);

    const retrieved = BaseComponent.queryComponentById(rootA, button.getId());
    expect(retrieved).toBe(button);
  });

  test('should not find component after unmount in container scope', () => {
    const button = new Button({text: 'Test'});
    button.mount(rootA);
    const id = button.getId();

    button.unmount();

    const retrieved = BaseComponent.queryComponentById(rootA, id);
    expect(retrieved).toBeNull();
  });

  test('should not find component after destroy in container scope', () => {
    const button = new Button({text: 'Test'});
    button.mount(rootA);
    const id = button.getId();

    button.destroy();

    const retrieved = BaseComponent.queryComponentById(rootA, id);
    expect(retrieved).toBeNull();
  });

  test('should retrieve component DOM element by ID in container scope', () => {
    const button = new Button({text: 'Test'});
    button.mount(rootA);

    const element = BaseComponent.queryElementById(rootA, button.getId());
    expect(element).toBe(button.getElement());
    expect(element?.textContent).toBe('Test');
  });

  test('should return null for non-existent component ID', () => {
    const component = BaseComponent.queryComponentById(rootA, 'non-existent-id');
    expect(component).toBeNull();
  });

  test('should return null for non-existent element ID', () => {
    const element = BaseComponent.queryElementById(rootA, 'non-existent-id');
    expect(element).toBeNull();
  });

  test('should support multiple components in same container', () => {
    const button1 = new Button({id: 'btn-1', text: 'Button 1'});
    const button2 = new Button({id: 'btn-2', text: 'Button 2'});
    const input = new Input({id: 'input-1', placeholder: 'Input'});

    button1.mount(rootA);
    button2.mount(rootA);
    input.mount(rootA);

    expect(BaseComponent.queryComponentById(rootA, 'btn-1')).toBe(button1);
    expect(BaseComponent.queryComponentById(rootA, 'btn-2')).toBe(button2);
    expect(BaseComponent.queryComponentById(rootA, 'input-1')).toBe(input);
  });

  test('should query by updated ID after rerender', () => {
    const button = new Button({id: 'old-id', text: 'Test'});
    button.mount(rootA);
    expect(BaseComponent.queryComponentById(rootA, 'old-id')).toBe(button);

    button.update({id: 'new-id'});

    expect(BaseComponent.queryComponentById(rootA, 'old-id')).toBeNull();
    expect(BaseComponent.queryComponentById(rootA, 'new-id')).toBe(button);
  });

  test('should work with Container component', () => {
    const container = new Container({
      children: [
        new Button({id: 'ok', text: 'OK'}),
        new Button({id: 'cancel', text: 'Cancel'})
      ]
    });

    container.mount(rootA);

    const okBtn = BaseComponent.queryComponentById(rootA, 'ok');
    expect(okBtn).toBeDefined();
    expect(okBtn instanceof Button).toBe(true);

    const cancelBtn = BaseComponent.queryComponentById(rootA, 'cancel');
    expect(cancelBtn).toBeDefined();
    expect(cancelBtn instanceof Button).toBe(true);
  });

  test('should isolate same ID in different mount roots', () => {
    const left = new Button({id: 'shared-id', text: 'Left'});
    const right = new Button({id: 'shared-id', text: 'Right'});

    left.mount(rootA);
    right.mount(rootB);

    expect(BaseComponent.queryComponentById(rootA, 'shared-id')).toBe(left);
    expect(BaseComponent.queryComponentById(rootB, 'shared-id')).toBe(right);
  });

  test('should generate unique IDs for different component types', () => {
    const button = new Button({text: 'Test'});
    const input = new Input();

    const buttonId = button.getId();
    const inputId = input.getId();

    expect(buttonId).toMatch(/^Button_/);
    expect(inputId).toMatch(/^Input_/);
    expect(buttonId).not.toBe(inputId);
  });

});


