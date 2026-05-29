import {Table} from '../../../src/components/complex/Table';

describe('Table', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render table headers and rows', () => {
    const table = new Table({
      columns: [
        {key: 'name', title: 'Name'},
        {key: 'age', title: 'Age'},
      ],
      data: [
        {name: 'Alice', age: 20},
        {name: 'Bob', age: 24},
      ],
    });

    table.mount(container);

    const headers = container.querySelectorAll('th');
    const rows = container.querySelectorAll('tbody tr');

    expect(headers.length).toBe(2);
    expect(rows.length).toBe(2);
    expect(rows[0]?.textContent).toContain('Alice');
  });

  it('should show empty text when no data', () => {
    const table = new Table({columns: [{key: 'name', title: 'Name'}], data: [], emptyText: 'Empty'});
    table.mount(container);

    expect(container.querySelector('.portableui-table-empty')?.textContent).toBe('Empty');
  });

  it('should invoke onRowClick', () => {
    const onRowClick = jest.fn();
    const table = new Table({
      columns: [{key: 'name', title: 'Name'}],
      data: [{name: 'Alice'}],
      onRowClick,
    });

    table.mount(container);
    container.querySelector('tbody tr')?.dispatchEvent(new MouseEvent('click', {bubbles: true}));

    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});

