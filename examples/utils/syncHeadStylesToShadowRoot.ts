const SHADOW_STYLE_CLONE_ATTR = 'data-portableui-shadow-clone';

/**
 * Copies document-level styles into a ShadowRoot so demo styles also apply in shadow mode.
 */
export function syncHeadStylesToShadowRoot(shadowRoot: ShadowRoot): void {
  const previousClones = shadowRoot.querySelectorAll(`style[${SHADOW_STYLE_CLONE_ATTR}], link[${SHADOW_STYLE_CLONE_ATTR}]`);
  previousClones.forEach((node) => node.remove());

  const sources = document.head.querySelectorAll('style, link[rel="stylesheet"]');
  sources.forEach((source) => {
    const clone = source.cloneNode(true);
    if (clone instanceof HTMLElement) {
      clone.setAttribute(SHADOW_STYLE_CLONE_ATTR, 'true');
      shadowRoot.insertBefore(clone, shadowRoot.firstChild);
    }
  });
}

