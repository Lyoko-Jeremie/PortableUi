import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export interface ModalProps extends ComponentProps {
  visible?: boolean;
  title?: string;
  content?: string | HTMLElement;
  width?: string | number;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  onOpen?: (self: Modal) => void;
  onClose?: (self: Modal) => void;
  onConfirm?: (self: Modal, event: MouseEvent) => void;
  onCancel?: (self: Modal, event: MouseEvent) => void;
}

export interface ModalState extends ComponentState {
  visible: boolean;
  title: string;
  content: string | HTMLElement | null;
}

export class Modal extends BaseComponent<ModalState> {
  constructor(props: ModalProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ModalProps;
    const state = this.signalState();
    const overlay = document.createElement('div');
    const container = document.createElement('div');
    const header = document.createElement('div');
    const body = document.createElement('div');

    applyCommonElementProps(overlay, props, 'portableui-modal');
    overlay.style.display = (state.visible ?? props.visible) ?? false ? 'flex' : 'none';

    overlay.classList.add('portableui-modal-overlay');
    container.className = 'portableui-modal-container';
    header.className = 'portableui-modal-header';
    body.className = 'portableui-modal-body';

    if (props.width !== undefined) {
      container.style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }

    const title = document.createElement('h3');
    title.className = 'portableui-modal-title';
    title.textContent = state.title ?? props.title ?? '';
    header.appendChild(title);

    if (props.showCloseButton ?? true) {
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'portableui-modal-close';
      closeButton.textContent = 'x';
      closeButton.addEventListener('click', () => this.close());
      header.appendChild(closeButton);
    }

    if (state.content instanceof HTMLElement) {
      body.appendChild(state.content);
    } else if (props.content instanceof HTMLElement) {
      body.appendChild(props.content);
    } else {
      body.textContent = (state.content ?? props.content) ?? '';
    }

    container.appendChild(header);
    container.appendChild(body);

    if (props.showFooter ?? true) {
      const footer = document.createElement('div');
      footer.className = 'portableui-modal-footer';

      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'portableui-modal-cancel';
      cancelBtn.textContent = props.cancelText ?? 'Cancel';
      cancelBtn.addEventListener('click', (event) => {
        const currentState = this.signalState();
        props.onCancel?.(this, event as MouseEvent);
        this.close();
      });

      const confirmBtn = document.createElement('button');
      confirmBtn.type = 'button';
      confirmBtn.className = 'portableui-modal-confirm';
      confirmBtn.textContent = props.confirmText ?? 'Confirm';
      confirmBtn.addEventListener('click', (event) => {
        const currentState = this.signalState();
        props.onConfirm?.(this, event as MouseEvent);
      });

      footer.appendChild(cancelBtn);
      footer.appendChild(confirmBtn);
      container.appendChild(footer);
    }

    overlay.addEventListener('click', (event) => {
      if (!(props.closeOnOverlayClick ?? true)) {
        return;
      }

      if (event.target === overlay) {
        this.close();
      }
    });

    overlay.appendChild(container);
    return overlay;
  }

  open(): void {
    const state = this.signalState();
    const wasVisible = state.visible ?? (this.props as ModalProps).visible ?? false;
    this.signalState({...state, visible: true});
    if (!wasVisible) {
      (this.props as ModalProps).onOpen?.(this);
    }
  }

  close(): void {
    const state = this.signalState();
    const wasVisible = state.visible ?? (this.props as ModalProps).visible ?? false;
    this.signalState({...state, visible: false});
    if (wasVisible) {
      (this.props as ModalProps).onClose?.(this);
    }
  }

  toggle(): void {
    const state = this.signalState();
    if (state.visible ?? (this.props as ModalProps).visible ?? false) {
      this.close();
    } else {
      this.open();
    }
  }

  setTitle(title: string): void {
    this.signalState({...this.signalState(), title});
  }

  setContent(content: string | HTMLElement): void {
    this.signalState({...this.signalState(), content});
  }
}

