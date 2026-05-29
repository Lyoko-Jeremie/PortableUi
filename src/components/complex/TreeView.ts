import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps extends ComponentProps {
  nodes?: TreeNode[];
  selectedId?: string;
  expandedIds?: string[];
  selectable?: boolean;
  onSelect?: (self: TreeView, event: MouseEvent, node: TreeNode) => void;
  onToggle?: (self: TreeView, event: MouseEvent, node: TreeNode, expanded: boolean) => void;
}

export class TreeView extends BaseComponent {
  constructor(props: TreeViewProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as TreeViewProps;
    const root = document.createElement('div');
    const tree = document.createElement('ul');

    applyCommonElementProps(root, props, 'portableui-treeview');
    tree.className = 'portableui-treeview-list';

    const expandedIds = new Set(props.expandedIds ?? []);
    this.renderNodes(tree, props.nodes ?? [], expandedIds, props.selectedId, props);

    root.appendChild(tree);
    return root;
  }

  setNodes(nodes: TreeNode[]): void {
    this.update({nodes});
  }

  setSelectedId(selectedId: string): void {
    this.update({selectedId});
  }

  setExpandedIds(expandedIds: string[]): void {
    this.update({expandedIds});
  }

  expandAll(): void {
    const props = this.props as TreeViewProps;
    this.update({expandedIds: this.collectNodeIds(props.nodes ?? [])});
  }

  collapseAll(): void {
    this.update({expandedIds: []});
  }

  private renderNodes(
    parent: HTMLElement,
    nodes: TreeNode[],
    expandedIds: Set<string>,
    selectedId: string | undefined,
    props: TreeViewProps
  ): void {
    for (const node of nodes) {
      const item = document.createElement('li');
      item.className = 'portableui-treeview-item';

      const row = document.createElement('div');
      row.className = 'portableui-treeview-row';
      row.dataset.nodeId = node.id;

      const hasChildren = (node.children?.length ?? 0) > 0;
      const expanded = hasChildren && expandedIds.has(node.id);

      if (hasChildren) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'portableui-treeview-toggle';
        toggle.textContent = expanded ? '-' : '+';
        toggle.disabled = node.disabled ?? false;
        toggle.addEventListener('click', (event) => {
          const nextExpandedIds = new Set((this.props as TreeViewProps).expandedIds ?? []);
          const nextExpanded = !nextExpandedIds.has(node.id);
          if (nextExpanded) {
            nextExpandedIds.add(node.id);
          } else {
            nextExpandedIds.delete(node.id);
          }

          this.update({expandedIds: [...nextExpandedIds]});
          props.onToggle?.(this, event as MouseEvent, node, nextExpanded);
        });
        row.appendChild(toggle);
      }

      const label = document.createElement('span');
      label.className = 'portableui-treeview-label';
      label.textContent = node.label;

      if (node.disabled) {
        label.classList.add('portableui-treeview-label-disabled');
      }

      if (selectedId === node.id) {
        label.classList.add('portableui-treeview-label-selected');
      }

      label.addEventListener('click', (event) => {
        if (node.disabled || !(props.selectable ?? true)) {
          return;
        }

        this.update({selectedId: node.id});
        props.onSelect?.(this, event as MouseEvent, node);
      });

      row.appendChild(label);
      item.appendChild(row);

      if (hasChildren) {
        const childrenList = document.createElement('ul');
        childrenList.className = 'portableui-treeview-children';
        childrenList.style.display = expanded ? 'block' : 'none';

        this.renderNodes(childrenList, node.children ?? [], expandedIds, selectedId, props);
        item.appendChild(childrenList);
      }

      parent.appendChild(item);
    }
  }

  private collectNodeIds(nodes: TreeNode[]): string[] {
    const allIds: string[] = [];

    for (const node of nodes) {
      allIds.push(node.id);
      if (node.children?.length) {
        allIds.push(...this.collectNodeIds(node.children));
      }
    }

    return allIds;
  }
}

