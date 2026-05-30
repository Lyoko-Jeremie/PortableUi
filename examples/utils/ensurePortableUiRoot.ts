const PORTABLEUI_SCOPE_ATTR = 'data-portableui-root';

/**
 * Ensure demo pages opt into theme selectors that rely on [data-portableui-root].
 */
export function ensurePortableUiRootScope(): HTMLElement {
  const scopedHost =
    (document.querySelector<HTMLElement>('[data-portableui-root]') ??
      document.querySelector<HTMLElement>('.page') ??
      document.getElementById('app') ??
      document.body);

  if (!scopedHost.getAttribute(PORTABLEUI_SCOPE_ATTR)) {
    scopedHost.setAttribute(PORTABLEUI_SCOPE_ATTR, 'scoped');
  }

  return scopedHost;
}

