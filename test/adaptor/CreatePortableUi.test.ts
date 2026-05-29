import {CreatePortableUi} from '../../src/adaptor';
import {Button, Container} from '../../src';

describe('CreatePortableUi', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    document.body.removeChild(host);
  });

  it('creates and mounts components from object children', () => {
    const ui = CreatePortableUi(host, {
      id: 'my-ui',
      children: {
        button1: {
          type: 'Button',
          props: {
            label: 'Click Me',
          },
        },
        input1: {
          type: 'Input',
          props: {
            placeholder: 'Type here',
          },
        },
      },
    });

    expect(host.getAttribute('data-portableui-id')).toBe('my-ui');
    expect(host.querySelector('#button1')?.textContent).toBe('Click Me');
    expect(host.querySelector('#input1')?.getAttribute('placeholder')).toBe('Type here');
    expect(ui.getComponent<Button>('button1')).toBeInstanceOf(Button);
  });

  it('mounts nested children into parent component element', () => {
    const ui = CreatePortableUi(host, {
      children: {
        panel: {
          type: 'Container',
          props: {className: 'panel'},
          children: {
            action: {
              type: 'Button',
              props: {text: 'Run'},
            },
          },
        },
      },
    });

    const panel = ui.getComponent<Container>('panel');
    expect(panel).toBeInstanceOf(Container);
    expect(panel?.getElement()?.querySelector('#action')?.textContent).toBe('Run');
  });

  it('supports array children and provides cleanup via destroy()', () => {
    const ui = CreatePortableUi(host, {
      children: [
        {type: 'Button', props: {id: 'first', text: 'A'}},
        {type: 'Button', props: {id: 'second', text: 'B'}},
      ],
    });

    expect(ui.getAllComponents()).toHaveLength(2);

    ui.destroy();

    expect(host.querySelector('#first')).toBeNull();
    expect(host.querySelector('#second')).toBeNull();
    expect(ui.getAllComponents()).toHaveLength(0);
  });

  it('throws for unknown component types', () => {
    expect(() => {
      CreatePortableUi(host, {
        children: {
          x: {
            type: 'UnknownComponent',
          },
        },
      });
    }).toThrow('Unknown component type: UnknownComponent');
  });
});

