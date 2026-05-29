import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
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

export class Toast extends BaseComponent {
  private autoCloseTimer: number | null = null;

  constructor(props: ToastProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ToastProps;
    const root = document.createElement('div');

    applyCommonElementProps(root, props, 'portableui-toast');

    root.classList.add(`portableui-toast-${props.type ?? 'info'}`);
    root.style.display = props.visible ?? false ? 'flex' : 'none';

    const message = document.createElement('span');
    message.className = 'portableui-toast-message';
    message.textContent = props.message ?? '';
    root.appendChild(message);

    if (props.closable ?? true) {
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'portableui-toast-close';
      closeButton.textContent = 'x';
      closeButton.addEventListener('click', () => this.hide());
      root.appendChild(closeButton);
    }

    if (props.visible) {
      this.scheduleAutoClose();
    } else {
      this.clearAutoCloseTimer();
    }

    return root;
  }

  show(message?: string, type?: ToastType): void {
    const nextProps: Partial<ToastProps> = {visible: true};

    if (message !== undefined) {
      nextProps.message = message;
    }

    if (type !== undefined) {
      nextProps.type = type;
    }

    this.update(nextProps);
    this.scheduleAutoClose();
  }

  hide(): void {
    const wasVisible = (this.props as ToastProps).visible ?? false;
    this.clearAutoCloseTimer();
    this.update({visible: false});

    if (wasVisible) {
      (this.props as ToastProps).onClose?.(this);
    }
  }

  setMessage(message: string): void {
    this.update({message});
  }

  setType(type: ToastType): void {
    this.update({type});
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

    const props = this.props as ToastProps;
    const duration = props.duration ?? 3000;
    if (duration <= 0 || !(props.visible ?? false)) {
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

