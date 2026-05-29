import {TreeView} from '../../../src/components/complex/TreeView';

describe('TreeView', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render root nodes', () => {
    const tree = new TreeView({
      nodes: [
        {id: 'a', label: 'A'},
        {id: 'b', label: 'B'},
      ],
    });

    tree.mount(container);

    expect(container.querySelectorAll('.portableui-treeview-item').length).toBe(2);
  });

  it('should select node on label click', () => {
    const onSelect = jest.fn();
    const tree = new TreeView({nodes: [{id: 'a', label: 'A'}], onSelect});
    tree.mount(container);

    container.querySelector('.portableui-treeview-label')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.portableui-treeview-label-selected')).not.toBeNull();
  });

  it('should toggle child visibility', () => {
    const tree = new TreeView({
      nodes: [{id: 'parent', label: 'Parent', children: [{id: 'child', label: 'Child'}]}],
      expandedIds: [],
    });

    tree.mount(container);
    const childList = container.querySelector('.portableui-treeview-children') as HTMLElement;
    expect(childList.style.display).toBe('none');

    container.querySelector('.portableui-treeview-toggle')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    const toggledChildList = container.querySelector('.portableui-treeview-children') as HTMLElement;
    expect(toggledChildList.style.display).toBe('block');
  });
});

