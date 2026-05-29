/**
 * Grid 网格布局组件测试
 */

import {Grid, GridItem} from '../../../src/components/container/Grid';
import {Button} from '../../../src/components/basic/Button';

describe('Grid', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('should create grid element', () => {
    const grid = new Grid({id: 'grid-container'});
    grid.mount(container);

    const element = grid.getElement();
    expect(element).toBeTruthy();
    expect(element?.className).toContain('portableui-grid');
  });

  test('should apply grid display', () => {
    const grid = new Grid();
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('display: grid');
  });

  test('should apply columns configuration', () => {
    const grid = new Grid({columns: 3});
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('grid-template-columns: repeat(3, 1fr)');
  });

  test('should apply rows configuration', () => {
    const grid = new Grid({rows: 2});
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('grid-template-rows: repeat(2, 1fr)');
  });

  test('should apply gap configuration', () => {
    const grid = new Grid({gap: 10, columnGap: 20, rowGap: 15});
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('column-gap: 20px');
    expect(styles).toContain('row-gap: 15px');
  });

  test('should apply autoRows and autoColumns', () => {
    const grid = new Grid({autoRows: 50, autoColumns: 100});
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('grid-auto-rows: 50px');
    expect(styles).toContain('grid-auto-columns: 100px');
  });

  test('should render children items', () => {
    const item1 = Grid.createItem();
    const item2 = Grid.createItem();
    const grid = new Grid({children: [item1, item2], columns: 2});
    grid.mount(container);

    const element = grid.getElement();
    const items = element?.querySelectorAll('.portableui-grid-item');
    expect(items?.length).toBe(2);
  });

  test('should create grid item with span configuration', () => {
    const item = Grid.createItem({columnSpan: 2, rowSpan: 1});
    item.mount(container);

    const element = item.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('grid-column: span 2');
    expect(styles).toContain('grid-row: span 1');
  });

  test('should add children dynamically', () => {
    const grid = new Grid({columns: 2});
    grid.mount(container);

    const button = new Button({text: 'Grid Item'});
    grid.addChild(button);

    const children = grid.getContainerChildren();
    expect(children.length).toBe(1);
  });

  test('should apply justifyContent and alignItems', () => {
    const grid = new Grid({
      columns: 2,
      justifyContent: 'center',
      alignItems: 'center',
    });
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('justify-content: center');
    expect(styles).toContain('align-items: center');
  });

  test('should apply backgroundColor and width', () => {
    const grid = new Grid({backgroundColor: '#f0f0f0', width: 400});
    grid.mount(container);

    const element = grid.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('background-color: #f0f0f0');
    expect(styles).toContain('width: 400px');
  });

  test('should unmount properly', () => {
    const grid = new Grid();
    grid.mount(container);

    expect(grid.isMounted()).toBe(true);
    grid.unmount();
    expect(grid.isMounted()).toBe(false);
  });
});

describe('GridItem', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('should create grid item element', () => {
    const item = new GridItem({id: 'grid-item'});
    item.mount(container);

    const element = item.getElement();
    expect(element).toBeTruthy();
    expect(element?.className).toContain('portableui-grid-item');
  });

  test('should apply column and row span', () => {
    const item = new GridItem({columnSpan: 2, rowSpan: 3});
    item.mount(container);

    const element = item.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('grid-column: span 2');
    expect(styles).toContain('grid-row: span 3');
  });

  test('should handle default span values', () => {
    const item = new GridItem();
    item.mount(container);

    const element = item.getElement();
    const styles = element?.getAttribute('style') || '';
    expect(styles).toContain('grid-column: auto');
    expect(styles).toContain('grid-row: auto');
  });
});


