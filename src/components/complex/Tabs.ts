import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from '../basic/internal';
import {Container,} from '../container/Container';
import type {ContainerProps} from '../container/Container';
import {Flex} from '../container/Flex';
import type {FlexProps} from '../container/Flex';
import {Grid} from '../container/Grid';
import type {GridProps} from '../container/Grid';
import {Group} from '../container/Group';
import type {GroupProps} from '../container/Group';
import {HtmlContainer} from '../container/HtmlContainer';
import type {HtmlContainerProps} from '../container/HtmlContainer';

export interface TabItem<C extends BaseComponent = Container> {
  id: string;
  title: string;
  content: C;
  disabled?: boolean;
}

export interface TabsProps extends ComponentProps {
  tabs?: TabItem[];
  activeTabId?: string;
  stretch?: boolean;
  onTabChange?: (self: Tabs, event: MouseEvent, tab: TabItem) => void;
}

export interface TabsState extends ComponentState {
  tabs: TabItem[];
  activeTabId: string;
}

export class Tabs extends BaseComponent<TabsState> {
  constructor(props: TabsProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as TabsProps;
    const state = this.signalState();
    const root = document.createElement('div');
    const header = document.createElement('div');
    const body = document.createElement('div');

    applyCommonElementProps(root, props, 'portableui-tabs');

    header.className = 'portableui-tabs-header';
    if (props.stretch) {
      header.classList.add('portableui-tabs-header-stretch');
    }
    body.className = 'portableui-tabs-body';

    const tabs = state.tabs ?? props.tabs ?? [];
    const activeTabId = this.resolveActiveTabId(tabs, state.activeTabId ?? props.activeTabId);

    for (const tab of tabs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'portableui-tabs-button';
      button.textContent = tab.title;
      button.disabled = tab.disabled ?? false;

      if (tab.id === activeTabId) {
        button.classList.add('portableui-tabs-button-active');
      }

      button.addEventListener('click', (event) => {
        if (tab.disabled) {
          return;
        }
        const currentState = this.signalState();
        this.signalState({...currentState, activeTabId: tab.id});
        props.onTabChange?.(this, event as MouseEvent, tab);
      });

      header.appendChild(button);
    }

    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (activeTab) {
      const contentContainer = activeTab.content;
      const containerElement = contentContainer.getElement();
      if (containerElement) {
        body.appendChild(containerElement);
      } else {
        contentContainer.mount(body);
      }
    }

    root.appendChild(header);
    root.appendChild(body);

    return root;
  }

  setTabs(tabs: TabItem[]): void {
    this.signalState({...this.signalState(), tabs: [...tabs]});
  }

  appendTab<C extends BaseComponent = Container>(tab: TabItem<C>): C {
    const state = this.signalState();
    const tabs = [...(state.tabs ?? []), tab as unknown as TabItem<Container>];
    this.signalState({...state, tabs});
    return tab.content;
  }

  add(tab: Omit<TabItem, 'content'>) {
    return {
      Container: (props?: ContainerProps) => {
        return this.appendTab({...tab, content: new Container(props)});
      },
      Flex: (props?: FlexProps) => {
        return this.appendTab({...tab, content: new Flex(props)});
      },
      Grid: (props?: GridProps) => {
        return this.appendTab({...tab, content: new Grid(props)});
      },
      Group: (props?: GroupProps) => {
        return this.appendTab({...tab, content: new Group(props)});
      },
      HtmlContainer: (props?: HtmlContainerProps) => {
        return this.appendTab({...tab, content: new HtmlContainer(props)});
      },
    }
  }

  setActiveTab(tabId: string): void {
    this.signalState({...this.signalState(), activeTabId: tabId});
  }

  getActiveTabId(): string {
    const state = this.signalState();
    const tabs = state.tabs ?? [];
    return this.resolveActiveTabId(tabs, state.activeTabId) ?? '';
  }

  private resolveActiveTabId(tabs: TabItem[], activeTabId: string | undefined): string | undefined {
    const activeTab = tabs.find((tab) => tab.id === activeTabId && !tab.disabled);
    if (activeTab) {
      return activeTab.id;
    }

    return tabs.find((tab) => !tab.disabled)?.id;
  }
}
