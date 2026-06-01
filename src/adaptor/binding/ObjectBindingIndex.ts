import {matchesDirtyPath} from './PathAccess';

export interface ObjectBindingRegistration {
  componentId: string;
  propName: string;
  targetId: number;
  key: string;
  changeDetection?: 'binding' | 'tree' | 'hybrid';
  componentRef: {current: any | null};
  updateFn?: () => void;
}

/**
 * 对象级绑定索引
 * 提供按对象 + 路径快速查找相关绑定的能力
 */
export class ObjectBindingIndex {
  private nextId = 1;
  private targetIds = new WeakMap<object, number>();
  private byTarget = new Map<number, ObjectBindingRegistration[]>();
  private byComponent = new Map<string, ObjectBindingRegistration[]>();

  getTargetId(target: object): number {
    const existing = this.targetIds.get(target);
    if (existing) return existing;
    const id = this.nextId++;
    this.targetIds.set(target, id);
    return id;
  }

  add(reg: ObjectBindingRegistration): void {
    const targetRegs = this.byTarget.get(reg.targetId) ?? [];
    targetRegs.push(reg);
    this.byTarget.set(reg.targetId, targetRegs);

    const componentRegs = this.byComponent.get(reg.componentId) ?? [];
    componentRegs.push(reg);
    this.byComponent.set(reg.componentId, componentRegs);
  }

  /**
   * 收集按对象 + 路径条件命中的绑定
   */
  collectByTargetAndKey(target: object, dirtyKey?: string): ObjectBindingRegistration[] {
    const targetId = this.targetIds.get(target);
    if (!targetId) return [];

    const regs = this.byTarget.get(targetId) ?? [];
    if (!dirtyKey) return regs;

    return regs.filter((r) => matchesDirtyPath(r.key, dirtyKey));
  }

  /**
   * 收集某组件的全部绑定
   */
  collectByComponent(componentId: string): ObjectBindingRegistration[] {
    return this.byComponent.get(componentId) ?? [];
  }

  /**
   * 从该对象移除全部绑定（释放资源）
   */
  removeByTarget(target: object): void {
    const targetId = this.targetIds.get(target);
    if (!targetId) return;

    const regs = this.byTarget.get(targetId) ?? [];
    for (const reg of regs) {
      const componentRegs = this.byComponent.get(reg.componentId) ?? [];
      const idx = componentRegs.indexOf(reg);
      if (idx >= 0) {
        componentRegs.splice(idx, 1);
      }
    }

    this.byTarget.delete(targetId);
  }

  /**
   * 从某组件移除全部绑定（销毁时调用）
   */
  removeByComponent(componentId: string): void {
    const regs = this.byComponent.get(componentId) ?? [];
    for (const reg of regs) {
      const targetRegs = this.byTarget.get(reg.targetId) ?? [];
      const idx = targetRegs.indexOf(reg);
      if (idx >= 0) {
        targetRegs.splice(idx, 1);
      }
      if (targetRegs.length === 0) {
        this.byTarget.delete(reg.targetId);
      }
    }

    this.byComponent.delete(componentId);
  }

  clear(): void {
    this.byTarget.clear();
    this.byComponent.clear();
  }
}

