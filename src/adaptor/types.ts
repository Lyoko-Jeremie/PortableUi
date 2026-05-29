import {BaseComponent} from '../core';

export type DeclarativeChildren = Record<string, DeclarativeComponentNode> | DeclarativeComponentNode[];

export interface DeclarativeComponentNode {
  type: string;
  props?: Record<string, any>;
  children?: DeclarativeChildren;
}

export interface PortableUiDeclarativeConfig {
  id?: string;
  children: DeclarativeChildren;
}

export interface PortableUiAdapter {
  id?: string;
  root: HTMLElement;
  getComponent<T extends BaseComponent = BaseComponent>(id: string): T | null;
  getAllComponents(): BaseComponent[];
  destroy(): void;
}

