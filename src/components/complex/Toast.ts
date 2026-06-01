import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps extends ComponentProps {
  message?: string;
  visible?: boolean;
  type?: ToastType;
  duration?: number;
  closable?: boolean;
  onClose?: (self: Toast) => void;
}

export interface ToastState extends ComponentState {
  message: string;
  visible: boolean;
  type: ToastType;
}

export class Toast extends BaseComponent<ToastState> {
  private autoCloseTimer: number | null = null;

  constructor(props: ToastProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ToastProps;
    const state = this.signalState();
    const root = document.createElement('div');

    applyCommonElementProps(root, props, 'portableui-toast');

    root.classList.add(`portableui-toast-${state.type ?? props.type ?? 'info'}`);
    root.style.display = (state.visible ?? props.visible) ?? false ? 'flex' : 'none';

    const message = document.createElement('span');
    message.className = 'portableui-toast-message';
    message.textContent = state.message ?? props.message ?? '';
    root.appendChild(message);

    if (props.closable ?? true) {
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'portableui-toast-close';
      closeButton.textContent = 'x';
      closeButton.addEventListener('click', () => this.hide());
      root.appendChild(closeButton);
    }

    if (state.visible ?? props.visible) {
      this.scheduleAutoClose();
    } else {
      this.clearAutoCloseTimer();
    }

    return root;
  }

  show(message?: string, type?: ToastType): void {
    const nextState: Partial<ToastState> = {visible: true};

    if (message !== undefined) {
      nextState.message = message;
    }

    if (type !== undefined) {
      nextState.type = type;
    }

    const currentState = this.signalState();
    this.signalState({...currentState, ...nextState} as ToastState);
    this.scheduleAutoClose();
  }

  hide(): void {
    const state = this.signalState();
    const wasVisible = state.visible ?? (this.props as ToastProps).visible ?? false;
    this.clearAutoCloseTimer();
    this.signalState({...state, visible: false});

    if (wasVisible) {
      (this.props as ToastProps).onClose?.(this);
    }
  }

  setMessage(message: string): void {
    this.signalState({...this.signalState(), message});
  }

  setType(type: ToastType): void {
    this.signalState({...this.signalState(), type});
  }

  override unmount(): void {
    this.clearAutoCloseTimer();
    super.unmount();
  }

  override destroy(): void {
    this.clearAutoCloseTimer();
    super.destroy();
  }

  private scheduleAutoClose(): void {
    this.clearAutoCloseTimer();

    const state = this.signalState();
    const duration = (this.props as ToastProps).duration ?? 3000;
    if (duration <= 0 || !(state.visible ?? (this.props as ToastProps).visible ?? false)) {
      return;
    }

    this.autoCloseTimer = window.setTimeout(() => {
      this.hide();
    }, duration);
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer !== null) {
      window.clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  }
}

