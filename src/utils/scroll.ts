function findScrollContainer(element: Element): Element | null {
  let current: Element | null = element;

  while (current) {
    let parent = current.parentElement;
    while (parent) {
      const style = getComputedStyle(parent);
      if (
        style.overflowY === 'auto' ||
        style.overflowY === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflow === 'scroll'
      ) {
        return parent;
      }
      parent = parent.parentElement;
    }

    // 到达 Shadow Root 边界时，跨越到 host element 继续向上查找
    const root = current.getRootNode();
    if (root instanceof ShadowRoot && root.host) {
      current = root.host;
    } else {
      break;
    }
  }

  return null;
}

export function scrollToElement(element: Element): void {
  const rect = element.getBoundingClientRect();
  console.log(
    '[ChatNest:scroll] element rect.top=',
    rect.top,
    'offsetTop=',
    (element as HTMLElement).offsetTop,
    'tag=',
    element.tagName,
    'class=',
    element.className?.slice(0, 40),
  );

  // 查找最近的滚动容器
  const container = findScrollContainer(element);

  if (container) {
    const containerEl = container as HTMLElement;

    // 豆包等平台使用负 scrollTop + CSS transform 做虚拟滚动，
    // 标准 scrollTop 计算会失效，直接 fallback 到 scrollIntoView
    if (containerEl.scrollTop < 0) {
      console.log('[ChatNest:scroll] negative scrollTop detected, using scrollIntoView');
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const targetScrollTop = containerEl.scrollTop + (rect.top - containerRect.top) - 20;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const clamped = Math.max(0, Math.min(targetScrollTop, maxScroll));

    console.log(
      '[ChatNest:scroll] container',
      container.tagName,
      container.className?.slice(0, 30),
      'scrollTop before=',
      containerEl.scrollTop,
      'target=',
      clamped,
      'max=',
      maxScroll,
    );

    // 某些网站（如 kimi）的自定义滚动库会拦截 smooth 滚动，先尝试 instant
    const beforeRectTop = rect.top;
    container.scrollTo({ top: clamped, behavior: 'instant' });

    setTimeout(() => {
      const afterScrollTop = containerEl.scrollTop;
      const afterRectTop = element.getBoundingClientRect().top;
      console.log('[ChatNest:scroll] container scrollTop after=', afterScrollTop);
      console.log('[ChatNest:scroll] element rect after=', afterRectTop);

      // Doubao 等平台使用 CSS transform 做虚拟滚动，scrollTo 不生效
      const moved = Math.abs(afterRectTop - beforeRectTop) > 5;
      const inView = afterRectTop > -100 && afterRectTop < window.innerHeight + 100;
      if (!moved && !inView) {
        console.log('[ChatNest:scroll] scrollTo did not work, falling back to scrollIntoView');
        element.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }, 50);
  } else {
    console.log('[ChatNest:scroll] no scroll container, fallback to window.scrollTo');
    const targetScrollY = window.scrollY + rect.top - 20;
    window.scrollTo({ top: targetScrollY, behavior: 'instant' });
  }
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
