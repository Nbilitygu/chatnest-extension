export function scrollToElement(element: Element, behavior: ScrollBehavior = 'smooth'): void {
  console.log('[ChatNest:scroll] scrollIntoView for', element.tagName, element.className?.slice(0, 60));
  element.scrollIntoView({ behavior, block: 'start' });
}

export function getElementScrollPercent(element: Element): number {
  const rect = element.getBoundingClientRect();
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  const absoluteTop = window.scrollY + rect.top;
  return Math.max(0, Math.min(1, absoluteTop / docHeight));
}

export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}
