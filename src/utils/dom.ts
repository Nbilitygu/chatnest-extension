export function queryShadowDOM(
  root: Document | Element | ShadowRoot,
  selector: string
): Element | null {
  const el = root.querySelector(selector);
  if (el) return el;

  const shadowHosts = root.querySelectorAll('*');
  for (const host of shadowHosts) {
    if (host.shadowRoot) {
      const found = queryShadowDOM(host.shadowRoot, selector);
      if (found) return found;
    }
  }
  return null;
}

export function queryAllShadowDOM(
  root: Document | Element | ShadowRoot,
  selector: string
): Element[] {
  const results: Element[] = [];
  results.push(...Array.from(root.querySelectorAll(selector)));

  const shadowHosts = root.querySelectorAll('*');
  for (const host of shadowHosts) {
    if (host.shadowRoot) {
      results.push(...queryAllShadowDOM(host.shadowRoot, selector));
    }
  }
  return results;
}

export function getTextContent(el: Element): string {
  const text = el.textContent || el.getAttribute('aria-label') || '';
  return text.trim();
}

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
