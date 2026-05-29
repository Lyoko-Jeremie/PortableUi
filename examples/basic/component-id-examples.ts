/**
 * 组件ID功能演示
 * 这个示例展示了如何使用组件ID来查询和操作组件
 */

import {Button} from '../../src/components/basic/Button';
import {Input} from '../../src/components/basic/Input';
import {Container} from '../../src/components/container/Container';
import {Label} from '../../src/components/basic/Label';
import {BaseComponent} from '../../src/core/BaseComponent';

// ============ 示例1：自动ID生成 ============

function example1_AutoIdGeneration() {
  console.log('=== 示例1：自动ID生成 ===');

  // 不指定ID时，系统自动生成
  const button = new Button({text: 'Click me'});
  console.log('自动生成的ID:', button.getId()); // 输出: Button_a1b2c3d4e (每次不同)

  const input = new Input({placeholder: 'Enter text'});
  console.log('自动生成的ID:', input.getId()); // 输出: Input_f5g6h7i8j (每次不同)
}

// ============ 示例2：指定自定义ID ============

function example2_CustomId() {
  console.log('\n=== 示例2：指定自定义ID ===');

  const submitBtn = new Button({
    id: 'submit-button',
    text: 'Submit'
  });

  const emailInput = new Input({
    id: 'email-field',
    type: 'email',
    placeholder: 'Email address'
  });

  console.log('Button ID:', submitBtn.getId()); // 输出: submit-button
  console.log('Input ID:', emailInput.getId()); // 输出: email-field
}

// ============ 示例3：通过ID查询组件 ============

function example3_QueryComponents() {
  console.log('\n=== 示例3：通过ID查询组件 ===');

  // 创建并挂载组件
  const container = document.createElement('div');

  const button = new Button({
    id: 'my-button',
    text: 'Click'
  });
  button.mount(container);

  // 通过ID获取组件实例
  const foundButton = BaseComponent.queryComponentById<Button>(container, 'my-button');
  console.log('找到的组件:', foundButton instanceof Button); // true

  // 修改组件
  if (foundButton instanceof Button) {
    foundButton.setText('Updated!');
  }

  // 通过ID直接获取DOM元素
  const dom = BaseComponent.queryElementById(container, 'my-button');
  console.log('DOM元素内容:', dom?.textContent); // Updated!
}

// ============ 示例4：在容器中使用ID ============

function example4_ContainerWithIds() {
  console.log('\n=== 示例4：在容器中使用ID ===');

  const container = document.createElement('div');

  const form = new Container({
    direction: 'vertical',
    gap: 10,
    padding: 20,
    children: [
      new Label({text: 'User Registration', id: 'form-title'}),
      new Input({
        id: 'name-field',
        placeholder: 'Full Name',
        required: true
      }),
      new Input({
        id: 'email-field',
        type: 'email',
        placeholder: 'Email Address',
        required: true
      }),
      new Input({
        id: 'password-field',
        type: 'password',
        placeholder: 'Password',
        required: true
      }),
      new Button({
        id: 'register-btn',
        text: 'Register',
        onClick: () => {
          // 在 form 组件根元素作用域中查询字段
          const nameField = form.findComponentById<Input>('name-field');
          const emailField = form.findComponentById<Input>('email-field');
          const pwdField = form.findComponentById<Input>('password-field');

          const userData = {
            name: nameField?.getValue(),
            email: emailField?.getValue(),
            password: pwdField?.getValue()
          };

          console.log('表单数据:', userData);
        }
      })
    ]
  });

  form.mount(container);

  // 演示如何修改表单字段
  const nameInput = form.findComponentById<Input>('name-field');
  nameInput?.setValue('John Doe');

  const emailInput = form.findComponentById<Input>('email-field');
  emailInput?.setValue('john@example.com');
}

// ============ 示例5：列出当前容器内的组件 ============

function example5_ListAllComponents() {
  console.log('\n=== 示例5：列出当前容器内的组件 ===');

  const container = document.createElement('div');

  // 创建多个组件
  const btn1 = new Button({id: 'btn-1', text: 'Button 1'});
  const btn2 = new Button({id: 'btn-2', text: 'Button 2'});
  const input1 = new Input({id: 'input-1'});

  btn1.mount(container);
  btn2.mount(container);
  input1.mount(container);

  // 在当前容器范围内收集组件
  const allComponents: BaseComponent[] = Array.from(container.querySelectorAll('[id]'))
    .map((element) => BaseComponent.queryComponentById(container, element.id))
    .filter((component): component is BaseComponent => component !== null);
  console.log('当前容器组件数量:', allComponents.length); // 3

  allComponents.forEach((comp: BaseComponent, index: number) => {
    console.log(`${index + 1}. ID: ${comp.getId()}, 类型: ${comp.constructor.name}`);
  });
}

// ============ 示例6：组件间通信 ============

function example6_ComponentCommunication() {
  console.log('\n=== 示例6：组件间通信 ============');

  const container = document.createElement('div');

  const counter = new Container({
    direction: 'horizontal',
    gap: 10,
    children: [
      new Button({
        id: 'decrement-btn',
        text: '-',
        onClick: () => updateCounter(-1)
      }),
      new Label({
        id: 'counter-display',
        text: 'Count: 0'
      }),
      new Button({
        id: 'increment-btn',
        text: '+',
        onClick: () => updateCounter(1)
      })
    ]
  });

  counter.mount(container);

  let currentCount = 0;

  function updateCounter(delta: number) {
    currentCount += delta;

    // 通过ID更新显示
    const display = counter.findComponentById<Label>('counter-display');
    if (display) {
      display.setText(`Count: ${currentCount}`);
    }
  }
}

// ============ 示例7：验证和清理 ============

function example7_ValidationAndCleanup() {
  console.log('\n=== 示例7：验证和清理 ============');

  const container = document.createElement('div');

  const button = new Button({id: 'temp-button', text: 'Temporary'});
  button.mount(container);

  const getMountedCount = () => {
    return Array.from(container.querySelectorAll('[id]'))
      .map((element) => BaseComponent.queryComponentById(container, element.id))
      .filter((component): component is BaseComponent => component !== null).length;
  };

  console.log('挂载前，组件数量:', getMountedCount()); // 1

  // 卸载单个组件
  button.unmount();
  console.log('卸载后，组件数量:', getMountedCount()); // 0

  console.log('卸载后查询:', BaseComponent.queryComponentById(container, 'temp-button')); // null
}

// ============ 示例8：ID重复处理 ============

function example8_DuplicateIdHandling() {
  console.log('\n=== 示例8：ID重复处理 ============');

  const container = document.createElement('div');

  const btn1 = new Button({id: 'duplicate', text: 'Button 1'});
  const btn2 = new Button({id: 'duplicate', text: 'Button 2'});

  btn1.mount(container);
  btn2.mount(container);

  // 重复ID会导致查询结果不确定（取决于DOM中的匹配顺序）
  const found = BaseComponent.queryComponentById(container, 'duplicate');
  console.log('查询结果是否确定:', found === btn1 || found === btn2); // true，但不应依赖顺序

  // 为了避免这种情况，应该为每个组件使用唯一的ID
}

// ============ 导出所有示例 ============

export const componentIdExamples = {
  example1_AutoIdGeneration,
  example2_CustomId,
  example3_QueryComponents,
  example4_ContainerWithIds,
  example5_ListAllComponents,
  example6_ComponentCommunication,
  example7_ValidationAndCleanup,
  example8_DuplicateIdHandling
};

// 运行所有示例
export function runAllExamples() {
  example1_AutoIdGeneration();
  example2_CustomId();
  example3_QueryComponents();
  example4_ContainerWithIds();
  example5_ListAllComponents();
  example6_ComponentCommunication();
  example7_ValidationAndCleanup();
  example8_DuplicateIdHandling();
}

