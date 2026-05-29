import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export interface CascadingOption {
  label: string;
  value: string;
  children?: CascadingOption[];
}

export interface CascadingSelectProps extends ComponentProps {
  options?: CascadingOption[];
  valuePath?: string[];
  placeholder?: string;
  onChange?: (self: CascadingSelect, event: Event, valuePath: string[]) => void;
}

export class CascadingSelect extends BaseComponent {
  constructor(props: CascadingSelectProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as CascadingSelectProps;
    const root = document.createElement('div');

    applyCommonElementProps(root, props, 'portableui-cascading-select');

    const valuePath = [...(props.valuePath ?? [])];
    let levelOptions = props.options ?? [];
    let level = 0;

    while (levelOptions.length > 0) {
      const select = document.createElement('select');
      select.className = 'portableui-cascading-select-level';
      select.dataset.level = String(level);

      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = props.placeholder ?? 'Please select';
      select.appendChild(placeholderOption);

      for (const option of levelOptions) {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        optionEl.selected = valuePath[level] === option.value;
        select.appendChild(optionEl);
      }

      select.addEventListener('change', (event) => {
        const nextValuePath = [...valuePath.slice(0, level)];
        if (select.value) {
          nextValuePath.push(select.value);
        }

        this.update({valuePath: nextValuePath});
        props.onChange?.(this, event, nextValuePath);
      });

      root.appendChild(select);

      const selectedValue = valuePath[level];
      const selectedOption = levelOptions.find((option) => option.value === selectedValue);
      levelOptions = selectedOption?.children ?? [];
      level += 1;

      if (!selectedOption) {
        break;
      }
    }

    return root;
  }

  setValuePath(valuePath: string[]): void {
    this.update({valuePath});
  }

  getValuePath(): string[] {
    return [...(((this.props as CascadingSelectProps).valuePath) ?? [])];
  }

  setOptions(options: CascadingOption[]): void {
    this.update({options});
  }
}

