import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface FileUploadProps extends ComponentProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  capture?: string;
  onChange?: (self: FileUpload, event: Event, files: File[]) => void;
}

export class FileUpload extends BaseComponent {
  constructor(props: FileUploadProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as FileUploadProps;
    const input = document.createElement('input');

    applyCommonElementProps(input, props, 'portableui-file-upload');

    input.type = 'file';
    input.multiple = props.multiple ?? false;
    input.disabled = props.disabled ?? false;

    if (props.accept) {
      input.accept = props.accept;
    }

    if (props.capture) {
      input.setAttribute('capture', props.capture);
    }

    input.addEventListener('change', (event) => {
      props.onChange?.(this, event, Array.from(input.files ?? []));
    });

    return input;
  }

  getFiles(): File[] {
    const input = this.element as HTMLInputElement | null;
    return Array.from(input?.files ?? []);
  }

  clearFiles(): void {
    const input = this.element as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }
}

