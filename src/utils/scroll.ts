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

  // 首选方案：浏览器原生的 scrollIntoView 能自动处理 column-reverse、padding 等复杂布局
  element.scrollIntoView({ behavior: 'instant', block: 'start' });

  setTimeout(() => {
    const afterRectTop = element.getBoundingClientRect().top;
    console.log('[ChatNest:scroll] element rect after scrollIntoView=', afterRectTop);

    // 如果 scrollIntoView 后元素仍不在视口顶部附近，尝试手动滚动容器
    const inViewport = afterRectTop > -50 && afterRectTop < 200;
    if (!inViewport) {
      console.log('[ChatNest:scroll] scrollIntoView did not bring element to top, trying container scroll');

      const container = findScrollContainer(element);
      if (container) {
        const containerEl = container as HTMLElement;
        const containerRect = container.getBoundingClientRect();
        const targetScrollTop = containerEl.scrollTop + (afterRectTop - containerRect.top) - 20;
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

        container.scrollTo({ top: clamped, behavior: 'instant' });

        setTimeout(() => {
          const finalRectTop = element.getBoundingClientRect().top;
          console.log('[ChatNest:scroll] container scrollTop after=', containerEl.scrollTop);
          console.log('[ChatNest:scroll] element rect after container scroll=', finalRectTop);
        }, 50);
      } else {
        console.log('[ChatNest:scroll] no scroll container, fallback to window.scrollTo');
        const targetScrollY = window.scrollY + afterRectTop - 20;
        window.scrollTo({ top: targetScrollY, behavior: 'instant' });
      }
    }
  }, 50);
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
