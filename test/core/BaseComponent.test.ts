import {BaseComponent} from '../../src/core';

class TestContainerComponent extends BaseComponent {
  protected render(): HTMLElement {
    const element = document.createElement('div');
    element.className = 'test-container';
    return element;
  }
}

class TestLeafComponent extends BaseComponent {
  protected render(): HTMLElement {
    const element = document.createElement('button');
    element.className = 'test-leaf';

    const content = document.createElement('span');
    content.className = 'test-leaf-content';
    content.textContent = 'leaf';
    element.appendChild(content);

    return element;
  }
}

describe('BaseComponent component tree query', () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    document.body.removeChild(host);
  });

  it('should query descendant child components in deep mode', () => {
    const parent = new TestContainerComponent({id: 'parent'});
    const child = new TestLeafComponent({id: 'child'});
    const grandChild = new TestLeafComponent({id: 'grand-child'});

    parent.mount(host);
    child.mount(parent.getElement()!);
    grandChild.mount(child.getElement()!);

    const descendants = parent.findChildComponents<BaseComponent>();
    const descendantIds = descendants.map((component) => component.getId());

    expect(descendantIds).toEqual(expect.arrayContaining(['child', 'grand-child']));
    expect(descendantIds).not.toContain('parent');
  });

  it('should query only direct child components in shallow mode', () => {
    const parent = new TestContainerComponent({id: 'parent'});
    const child = new TestLeafComponent({id: 'child'});
    const grandChild = new TestLeafComponent({id: 'grand-child'});

    parent.mount(host);
    child.mount(parent.getElement()!);
    grandChild.mount(child.getElement()!);

    const directChildren = parent.findChildComponents<BaseComponent>(false);
    const directChildIds = directChildren.map((component) => component.getId());

    expect(directChildIds).toEqual(['child']);
  });

  it('should query nearest parent component from instance API', () => {
    const parent = new TestContainerComponent({id: 'parent'});
    const child = new TestLeafComponent({id: 'child'});
    const grandChild = new TestLeafComponent({id: 'grand-child'});

    parent.mount(host);
    child.mount(parent.getElement()!);
    grandChild.mount(child.getElement()!);

    expect(child.findParentComponent<BaseComponent>()?.getId()).toBe('parent');
    expect(grandChild.findParentComponent<BaseComponent>()?.getId()).toBe('child');
  });

  it('should support static parent query from any DOM node', () => {
    const parent = new TestContainerComponent({id: 'parent'});
    const child = new TestLeafComponent({id: 'child'});

    parent.mount(host);
    child.mount(parent.getElement()!);

    const innerNode = child.getElement()?.querySelector('.test-leaf-content') ?? null;
    const owner = BaseComponent.queryParentComponent<TestLeafComponent>(innerNode);

    expect(owner?.getId()).toBe('child');
    expect(BaseComponent.queryParentComponent(host)).toBeNull();
  });
});

