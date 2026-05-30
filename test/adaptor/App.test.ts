import {App, Button, Input} from '../../src';

describe('App imperative adaptor', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    document.body.removeChild(host);
  });

  it('creates a root scope and mounts basic components', () => {
    const app = new App(host, {id: 'root'});

    const button = app.addButton({id: 'btn1', text: 'Click Me'});
    const input = app.addInput({id: 'input1', placeholder: 'Type here'});

    expect(button).toBeInstanceOf(Button);
    expect(input).toBeInstanceOf(Input);
    expect(host.querySelector('#root')).toBeTruthy();
    expect(host.querySelector('#btn1')?.textContent).toBe('Click Me');
    expect(host.querySelector('#input1')?.getAttribute('placeholder')).toBe('Type here');
    expect(app.getComponent('btn1')).toBe(button);
  });

  it('supports nested tab scopes', () => {
    const app = new App(host, {id: 'root'});

    const tab = app.addTab({id: 'tab1'});
    tab.addButton({id: 'tabBtn1', text: 'Tab Button'});
    tab.addInput({id: 'tabInput1', placeholder: 'Tab input'});

    const tabElement = host.querySelector('#tab1');
    expect(tabElement).toBeTruthy();
    expect(tabElement?.querySelector('#tabBtn1')?.textContent).toBe('Tab Button');
    expect(tabElement?.querySelector('#tabInput1')?.getAttribute('placeholder')).toBe('Tab input');
  });

  it('throws on duplicate ids', () => {
    const app = new App(host, {id: 'root'});
    app.addButton({id: 'same-id', text: 'A'});

    expect(() => app.addInput({id: 'same-id'})).toThrow('Duplicate component id: same-id');
  });

  it('destroys all mounted components in reverse order', () => {
    const app = new App(host, {id: 'root'});

    app.addButton({id: 'btn1', text: 'A'});
    const tab = app.addTab({id: 'tab1'});
    tab.addInput({id: 'tabInput'});

    expect(app.getAllComponents().length).toBeGreaterThan(1);

    app.destroy();

    expect(host.querySelector('#root')).toBeNull();
    expect(host.querySelector('#btn1')).toBeNull();
    expect(host.querySelector('#tab1')).toBeNull();
    expect(app.getAllComponents()).toHaveLength(0);
  });
});

