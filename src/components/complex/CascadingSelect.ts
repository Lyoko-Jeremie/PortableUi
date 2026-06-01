import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps, ComponentState} from '../../types';
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

export interface CascadingSelectState extends ComponentState {
  valuePath: string[];
  options: CascadingOption[];
}

export class CascadingSelect extends BaseComponent<CascadingSelectState> {
  constructor(props: CascadingSelectProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as CascadingSelectProps;
    const state = this.signalState();
    const root = document.createElement('div');

    applyCommonElementProps(root, props, 'portableui-cascading-select');

    const valuePath = [...(state.valuePath ?? props.valuePath ?? [])];
    let levelOptions = state.options ?? props.options ?? [];
    let level = 0;

    while (levelOptions.length > 0) {
      const select = document.createElement('select');
      select.className = 'portableui-cascading-select-level';
      select.dataset.level = String(level);
      const levelIndex = level;

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
        const currentState = this.signalState();
        const currentValuePath = [
          ...(currentState.valuePath ?? (this.props as CascadingSelectProps).valuePath ?? []),
        ];
        const nextValuePath = [...currentValuePath.slice(0, levelIndex)];
        if (select.value) {
          nextValuePath.push(select.value);
        }

        this.signalState({...currentState, valuePath: nextValuePath});
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
    this.signalState({...this.signalState(), valuePath: [...valuePath]});
  }

  getValuePath(): string[] {
    return [...(this.signalState().valuePath ?? [])];
  }

  setOptions(options: CascadingOption[]): void {
    this.signalState({...this.signalState(), options: [...options]});
  }
}

