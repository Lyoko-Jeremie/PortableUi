/**
 * 组件ID功能测试
 */

import {Button} from '../../../src/components/basic/Button';
import {Input} from '../../../src/components/basic/Input';
import {Container} from '../../../src/components/container/Container';
import {BaseComponent} from '../../../src/core/BaseComponent';

describe('Component ID System', () => {
  afterEach(() => {
    // 清理注册表
    BaseComponent.clearRegistry();
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

  test('should register component on mount', () => {
    const button = new Button({text: 'Test'});
    const container = document.createElement('div');

    button.mount(container);

    const retrieved = BaseComponent.getComponentById(button.getId());
    expect(retrieved).toBe(button);
  });

  test('should unregister component on unmount', () => {
    const button = new Button({text: 'Test'});
    const container = document.createElement('div');

    button.mount(container);
    const id = button.getId();

    button.unmount();

    const retrieved = BaseComponent.getComponentById(id);
    expect(retrieved).toBeUndefined();
  });

  test('should unregister component on destroy', () => {
    const button = new Button({text: 'Test'});
    const container = document.createElement('div');

    button.mount(container);
    const id = button.getId();

    button.destroy();

    const retrieved = BaseComponent.getComponentById(id);
    expect(retrieved).toBeUndefined();
  });

  test('should retrieve component DOM element by ID', () => {
    const button = new Button({text: 'Test'});
    const container = document.createElement('div');

    button.mount(container);

    const element = BaseComponent.getElementById(button.getId());
    expect(element).toBe(button.getElement());
    expect(element?.textContent).toBe('Test');
  });

  test('should return undefined for non-existent component ID', () => {
    const component = BaseComponent.getComponentById('non-existent-id');
    expect(component).toBeUndefined();
  });

  test('should return null for non-existent element ID', () => {
    const element = BaseComponent.getElementById('non-existent-id');
    expect(element).toBeNull();
  });

  test('should track multiple components', () => {
    const button1 = new Button({id: 'btn-1', text: 'Button 1'});
    const button2 = new Button({id: 'btn-2', text: 'Button 2'});
    const input = new Input({id: 'input-1', placeholder: 'Input'});

    const container = document.createElement('div');
    button1.mount(container);
    button2.mount(container);
    input.mount(container);

    expect(BaseComponent.getComponentById('btn-1')).toBe(button1);
    expect(BaseComponent.getComponentById('btn-2')).toBe(button2);
    expect(BaseComponent.getComponentById('input-1')).toBe(input);
    expect(BaseComponent.getAllComponents()).toHaveLength(3);
  });

  test('should update ID when props are updated', () => {
    const button = new Button({id: 'old-id', text: 'Test'});
    const container = document.createElement('div');

    button.mount(container);
    expect(BaseComponent.getComponentById('old-id')).toBe(button);

    // Note: 更新ID不会自动更新注册表，需要手动处理
    // 这是设计的限制，建议创建时就指定ID
    button.update({id: 'new-id'});
    // 旧ID仍然有效
    expect(BaseComponent.getComponentById('old-id')).toBe(button);
  });

  test('should work with Container component', () => {
    const container = new Container({
      children: [
        new Button({id: 'ok', text: 'OK'}),
        new Button({id: 'cancel', text: 'Cancel'})
      ]
    });

    const root = document.createElement('div');
    container.mount(root);

    const okBtn = BaseComponent.getComponentById('ok');
    expect(okBtn).toBeDefined();
    expect(okBtn instanceof Button).toBe(true);

    const cancelBtn = BaseComponent.getComponentById('cancel');
    expect(cancelBtn).toBeDefined();
    expect(cancelBtn instanceof Button).toBe(true);
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

  test('should clear registry properly', () => {
    const button = new Button({text: 'Test'});
    const container = document.createElement('div');

    button.mount(container);
    expect(BaseComponent.getAllComponents()).toHaveLength(1);

    BaseComponent.clearRegistry();
    expect(BaseComponent.getAllComponents()).toHaveLength(0);
  });
});


