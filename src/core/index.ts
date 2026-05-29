/**
 * 核心系统导出
 */

export {BaseComponent} from './BaseComponent';
export {defineComponent} from './CustomComponent';
export {DOMAccessor} from './DOMAccessor';
export {
  ExtensibilityManager,
  extensibilityManager,
  type Middleware,
  type MiddlewareContext,
  type ExtensibilityHook,
  type HookHandler,
  type ComponentConstructor,
  type CustomComponentDefinition,
  type PluginAPI,
  type PortableUiPlugin
} from './Extensibility';
export {EventSystem, globalEventSystem} from './EventSystem';
export {StateManager, stateManager} from './StateManager';
export {StyleIsolation, styleIsolation} from './StyleIsolation';
