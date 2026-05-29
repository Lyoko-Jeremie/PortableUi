import {BaseComponent} from '../../core';
import {ComponentElement, ComponentProps} from '../../types';
import {applyCommonElementProps} from '../basic/internal';

export interface ProgressProps extends ComponentProps {
  value?: number;
  min?: number;
  max?: number;
  showLabel?: boolean;
  labelFormatter?: (value: number, min: number, max: number) => string;
  indeterminate?: boolean;
  color?: string;
  height?: string | number;
}

export class Progress extends BaseComponent {
  constructor(props: ProgressProps = {}) {
    super(props);
  }

  protected render(): ComponentElement {
    const props = this.props as ProgressProps;
    const root = document.createElement('div');
    const track = document.createElement('div');
    const bar = document.createElement('div');

    applyCommonElementProps(root, props, 'portableui-progress');

    track.className = 'portableui-progress-track';
    bar.className = 'portableui-progress-bar';

    const min = props.min ?? 0;
    const max = props.max ?? 100;
    const value = this.clamp(props.value ?? 0, min, max);
    const ratio = max > min ? ((value - min) / (max - min)) * 100 : 0;

    if (props.indeterminate ?? false) {
      bar.style.width = '100%';
      bar.classList.add('portableui-progress-indeterminate');
    } else {
      bar.style.width = `${ratio}%`;
      bar.setAttribute('aria-valuenow', String(value));
    }

    bar.setAttribute('aria-valuemin', String(min));
    bar.setAttribute('aria-valuemax', String(max));
    bar.setAttribute('role', 'progressbar');

    if (props.color) {
      bar.style.backgroundColor = props.color;
    }

    if (props.height !== undefined) {
      track.style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }

    track.appendChild(bar);
    root.appendChild(track);

    if (props.showLabel ?? true) {
      const label = document.createElement('span');
      label.className = 'portableui-progress-label';
      label.textContent = props.labelFormatter
        ? props.labelFormatter(value, min, max)
        : `${Math.round(ratio)}%`;
      root.appendChild(label);
    }

    return root;
  }

  setValue(value: number): void {
    this.update({value});
  }

  increment(step: number = 1): void {
    const props = this.props as ProgressProps;
    const nextValue = (props.value ?? 0) + step;
    this.update({value: nextValue});
  }

  setRange(min: number, max: number): void {
    this.update({min, max});
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}

