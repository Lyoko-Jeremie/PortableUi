import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from './internal';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentProps {
  options?: SelectOption[];
  value?: string | string[];
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  placeholder?: string;
  onChange?: (event: Event, value: string | string[]) => void;
}

export class Select extends BaseComponent {
  constructor(props: SelectProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as SelectProps;
    const select = document.createElement('select');

    applyCommonElementProps(select, props, 'portableui-select');
    select.multiple = props.multiple ?? false;
    select.disabled = props.disabled ?? false;
    select.required = props.required ?? false;

    if (props.name) {
      select.name = props.name;
    }

    this.buildOptions(select, props);

    select.addEventListener('change', (event) => {
      props.onChange?.(event, this.readSelectValue(select));
    });

    return select;
  }

  getValue(): string | string[] {
    const select = this.element as HTMLSelectElement | null;
    if (!select) {
      return '';
    }

    return this.readSelectValue(select);
  }

  setValue(value: string | string[]): void {
    this.update({value});
  }

  setOptions(options: SelectOption[]): void {
    this.update({options});
  }

  private buildOptions(select: HTMLSelectElement, props: SelectProps): void {
    const valueSet = new Set(Array.isArray(props.value) ? props.value : [props.value ?? '']);

    if (props.placeholder && !props.multiple) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = props.placeholder;
      placeholderOption.disabled = true;
      placeholderOption.selected = !props.value;
      select.appendChild(placeholderOption);
    }

    for (const option of props.options ?? []) {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      optionElement.disabled = option.disabled ?? false;
      optionElement.selected = valueSet.has(option.value);
      select.appendChild(optionElement);
    }
  }

  private readSelectValue(select: HTMLSelectElement): string | string[] {
    if (select.multiple) {
      return Array.from(select.selectedOptions).map((option) => option.value);
    }

    return select.value;
  }
}

