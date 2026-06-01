import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, rowIndex: number) => string | HTMLElement;
}

export interface TableProps<T = Record<string, unknown>> extends ComponentProps {
  columns?: TableColumn<T>[];
  data?: T[];
  bordered?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  emptyText?: string;
  onRowClick?: (self: Table<T>, event: MouseEvent, row: T, rowIndex: number) => void;
}

export interface TableState<T = Record<string, unknown>> extends ComponentState {
  data: T[];
  columns: TableColumn<T>[];
}

export class Table<T = Record<string, unknown>> extends BaseComponent<TableState<T>> {
  constructor(props: TableProps<T> = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as TableProps<T>;
    const state = this.signalState();
    const root = document.createElement('div');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    applyCommonElementProps(root, props, 'portableui-table');

    if (props.bordered ?? true) {
      root.classList.add('portableui-table-bordered');
    }
    if (props.striped ?? false) {
      root.classList.add('portableui-table-striped');
    }
    if (props.hoverable ?? true) {
      root.classList.add('portableui-table-hoverable');
    }

    table.className = 'portableui-table-element';

    this.buildHeader(thead, state.columns ?? props.columns ?? []);
    this.buildRows(tbody, state.columns ?? props.columns ?? [], state.data ?? props.data ?? [], props);

    table.appendChild(thead);
    table.appendChild(tbody);
    root.appendChild(table);

    return root;
  }

  setRows(data: T[]): void {
    this.signalState({...this.signalState(), data: [...data]});
  }

  setColumns(columns: TableColumn<T>[]): void {
    this.signalState({...this.signalState(), columns: [...columns]});
  }

  getData(): T[] {
    return [...(this.signalState().data ?? [])];
  }

  appendRow(row: T): void {
    const state = this.signalState();
    this.signalState({...state, data: [...(state.data ?? []), row]});
  }

  clearRows(): void {
    this.signalState({...this.signalState(), data: []});
  }

  private buildHeader(thead: HTMLTableSectionElement, columns: TableColumn<T>[]): void {
    const tr = document.createElement('tr');

    for (const column of columns) {
      const th = document.createElement('th');
      th.textContent = column.title;

      if (column.width !== undefined) {
        th.style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
      }

      if (column.align) {
        th.style.textAlign = column.align;
      }

      tr.appendChild(th);
    }

    thead.appendChild(tr);
  }

  private buildRows(
    tbody: HTMLTableSectionElement,
    columns: TableColumn<T>[],
    rows: T[],
    props: TableProps<T>
  ): void {
    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = Math.max(columns.length, 1);
      td.className = 'portableui-table-empty';
      td.textContent = props.emptyText ?? 'No data';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    rows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = String(rowIndex);

      tr.addEventListener('click', (event) => {
        props.onRowClick?.(this, event as MouseEvent, row, rowIndex);
      });

      for (const column of columns) {
        const td = document.createElement('td');
        const value = this.readRowValue(row, column.key);

        if (column.align) {
          td.style.textAlign = column.align;
        }

        if (column.render) {
          const customNode = column.render(value, row, rowIndex);
          if (customNode instanceof HTMLElement) {
            td.appendChild(customNode);
          } else {
            td.textContent = String(customNode ?? '');
          }
        } else {
          td.textContent = String(value ?? '');
        }

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });
  }

  private readRowValue(row: T, key: keyof T | string): unknown {
    const rowObj = row as Record<string, unknown>;
    return rowObj[String(key)];
  }
}


