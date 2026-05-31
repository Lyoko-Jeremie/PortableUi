import type {ComponentProps} from '../types';
import {BaseComponent} from './BaseComponent';
import type {ComponentConstructor, CustomComponentDefinition} from './Extensibility';

/**
 * 通过渲染函数快速定义一个自定义组件，避免每次都手写子类。
 */
export function defineComponent<P extends ComponentProps = ComponentProps>(
  definition: CustomComponentDefinition<P>
): ComponentConstructor<P> {
  return class DefinedComponent extends BaseComponent<P> {
    constructor(props: P = {} as P) {
      const defaultProps = definition.defaultProps ?? {};
      super({...defaultProps, ...props});
    }

    protected render(): HTMLElement {
      return definition.render(this.props as P, this);
    }
  };
}

