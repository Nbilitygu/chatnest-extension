import type { UserMessage, DisplayMode } from '../types';
import { detectDarkMode, injectStyles } from './styles';
import { showTooltip, hideTooltip } from './tooltip';
import { scrollToElement } from '../utils/scroll';
import { throttle, debounce } from '../utils/throttle';

const BAR_ID = 'chatnest-bar';
const PANEL_ID = 'chatnest-panel';
const LIST_ID = 'chatnest-panel-list';
const FAB_ID = 'chatnest-fab';
const FLOATING_PANEL_ID = 'chatnest-floating-panel';

interface NavbarState {
  visible: boolean;
  expanded: boolean;
  mode: DisplayMode;
  messages: UserMessage[];
  activeId: string | null;
}

let barEl: HTMLElement | null = null;
let panelEl: HTMLElement | null = null;
let listEl: HTMLElement | null = null;
let fabEl: HTMLElement | null = null;
let floatingPanelEl: HTMLElement | null = null;
let floatingListEl: HTMLElement | null = null;
let state: NavbarState = {
  visible: true,
  expanded: false,
  mode: 'sidebar',
  messages: [],
  activeId: null,
};
let collapseTimer: ReturnType<typeof setTimeout> | null = null;

// Cached marker tops for proximity lookup during mousemove
let markerTops: number[] = [];
let lastMessagesHash = '';

// FAB drag state
let fabY = 0;
let isDraggingFab = false;
let fabDragStartY = 0;
let fabDragStartMouseY = 0;
let fabHasDragged = false;

function hashMessages(messages: UserMessage[]): string {
  return messages.map(m => m.id + ':' + m.text.slice(0, 30)).join('|');
}

function debug(...args: unknown[]): void {
  console.log('[ChatNest:navbar]', ...args);
}

export function destroyNavbar(): void {
  document.getElementById(BAR_ID)?.remove();
  document.getElementById(PANEL_ID)?.remove();
  document.getElementById(FAB_ID)?.remove();
  document.getElementById(FLOATING_PANEL_ID)?.remove();
  document.getElementById('chatnest-tooltip')?.remove();
  document.getElementById('chatnest-styles')?.remove();

  barEl = null;
  panelEl = null;
  listEl = null;
  fabEl = null;
  floatingPanelEl = null;
  floatingListEl = null;
  markerTops = [];
  state = {
    visible: true,
    expanded: false,
    mode: 'sidebar',
    messages: [],
    activeId: null,
  };
}

export function initNavbar(): void {
  debug('initNavbar called');

  destroyNavbar();

  injectStyles();
  createBar();
  createPanel();
  createFab();
  createFloatingPanel();
  updateTheme();

  window.addEventListener('scroll', throttle(updateActiveMarker, 100), true);
  window.addEventListener('resize', debounce(() => {
    renderMarkers();
    updateActiveMarker();
  }, 200));

  // Close floating panel when clicking outside
  document.addEventListener('mousedown', (e) => {
    if (
      state.mode === 'floating' &&
      state.expanded &&
      floatingPanelEl &&
      fabEl &&
      !floatingPanelEl.contains(e.target as Node) &&
      !fabEl.contains(e.target as Node)
    ) {
      collapsePanel();
    }
  });

  const observer = new MutationObserver(debounce(() => {
    updateTheme();
  }, 500));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
}

export function setMode(mode: DisplayMode): void {
  if (state.mode === mode) return;
  state.mode = mode;
  state.expanded = false;

  applyMode();
  renderMarkers();
}

function applyMode(): void {
  if (state.mode === 'sidebar') {
    if (barEl) barEl.style.display = state.visible ? 'block' : 'none';
    if (panelEl) panelEl.style.display = 'none';
    if (fabEl) fabEl.style.display = 'none';
    if (floatingPanelEl) floatingPanelEl.classList.remove('visible');
  } else {
    if (barEl) barEl.style.display = 'none';
    if (panelEl) panelEl.style.display = 'none';
    if (fabEl) fabEl.style.display = state.visible ? 'flex' : 'none';
    if (floatingPanelEl) {
      floatingPanelEl.classList.toggle('visible', state.expanded);
      floatingPanelEl.style.display = state.visible ? 'flex' : 'none';
    }
  }
}

function createBar(): void {
  barEl = document.createElement('div');
  barEl.id = BAR_ID;
  debug('bar element created');

  // Proximity-based hover: find nearest marker and show tooltip
  barEl.addEventListener('mousemove', (e) => {
    if (!barEl || state.messages.length === 0) return;

    const rect = barEl.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    // Find the marker closest to mouse Y
    let closestIdx = 0;
    let minDist = Infinity;
    markerTops.forEach((top, idx) => {
      const dist = Math.abs(mouseY - top);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    // Only show if within reasonable proximity (60px)
    if (minDist > 60) {
      hideTooltip();
      return;
    }

    const msg = state.messages[closestIdx];
    if (msg) {
      const targetTop = markerTops[closestIdx];
      showTooltip(msg.text, rect.left, rect.top + targetTop);
    }
  });

  barEl.addEventListener('mouseleave', () => {
    hideTooltip();
  });

  // Click anywhere on bar → jump to nearest message
  barEl.addEventListener('mousedown', (e) => {
    if (!barEl || state.messages.length === 0) return;

    const rect = barEl.getBoundingClientRect();
    const clickY = e.clientY - rect.top;

    // Find nearest marker to click position
    let closestIdx = 0;
    let minDist = Infinity;
    markerTops.forEach((top, idx) => {
      const dist = Math.abs(clickY - top);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = idx;
      }
    });

    const msg = state.messages[closestIdx];
    debug('bar click nearest msg', closestIdx, 'id:', msg?.id);
    if (msg) {
      scrollToElement(msg.element);
    }
  });

  document.body.appendChild(barEl);
  debug('bar appended to body');
}

function createPanel(): void {
  panelEl = document.createElement('div');
  panelEl.id = PANEL_ID;

  const header = document.createElement('div');
  header.id = 'chatnest-panel-header';
  header.textContent = '对话导航';
  panelEl.appendChild(header);

  listEl = document.createElement('div');
  listEl.id = LIST_ID;
  panelEl.appendChild(listEl);

  const backToTop = document.createElement('button');
  backToTop.id = 'chatnest-back-to-top';
  backToTop.textContent = '↓ 返回最近提问';
  backToTop.addEventListener('mousedown', () => {
    debug('back to top clicked');
    scrollToTop();
  });
  panelEl.appendChild(backToTop);

  panelEl.addEventListener('mouseenter', () => {
    if (collapseTimer) clearTimeout(collapseTimer);
  });

  panelEl.addEventListener('mouseleave', () => {
    scheduleCollapse();
  });

  document.body.appendChild(panelEl);
  debug('panel created');
}

function updateFloatingPanelPosition(): void {
  if (!floatingPanelEl || !fabEl) return;
  const fabRect = fabEl.getBoundingClientRect();
  const panelHeight = 380;
  // Position panel above FAB, clamped to viewport
  let panelTop = fabRect.top - panelHeight - 12;
  if (panelTop < 10) panelTop = fabRect.bottom + 12;
  if (panelTop + panelHeight > window.innerHeight - 10) {
    panelTop = Math.max(10, window.innerHeight - panelHeight - 10);
  }
  floatingPanelEl.style.top = `${panelTop}px`;
  floatingPanelEl.style.bottom = 'auto';
  floatingPanelEl.style.right = '0px';
}

function createFab(): void {
  fabEl = document.createElement('button');
  fabEl.id = FAB_ID;
  fabEl.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="18" x2="20" y2="18"></line>
    </svg>
  `;
  fabEl.title = 'ChatNest 对话导航';

  // Default position: snapped to right edge at 70% of viewport height
  fabY = window.innerHeight * 0.7;
  fabEl.style.top = `${fabY}px`;
  fabEl.style.bottom = 'auto';
  fabEl.classList.add('chatnest-fab-snapped');

  fabEl.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingFab = true;
    fabHasDragged = false;
    fabDragStartY = fabY;
    fabDragStartMouseY = e.clientY;

    if (fabEl) {
      fabEl.style.transition = 'none';
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingFab || !fabEl) return;
      const dy = ev.clientY - fabDragStartMouseY;
      if (Math.abs(dy) > 3) fabHasDragged = true;
      fabY = Math.max(28, Math.min(window.innerHeight - 76, fabDragStartY + dy));
      fabEl.style.top = `${fabY}px`;
      fabEl.classList.remove('chatnest-fab-snapped');
      updateFloatingPanelPosition();
    };

    const onMouseUp = () => {
      isDraggingFab = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (fabEl) {
        fabEl.style.transition = '';
      }

      if (fabHasDragged) {
        // Snap to right edge
        if (fabEl) {
          fabEl.classList.add('chatnest-fab-snapped');
        }
        updateFloatingPanelPosition();
      } else {
        // It was a click, toggle panel
        toggleFloatingPanel();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  document.body.appendChild(fabEl);
}

function createFloatingPanel(): void {
  floatingPanelEl = document.createElement('div');
  floatingPanelEl.id = FLOATING_PANEL_ID;

  const header = document.createElement('div');
  header.className = 'chatnest-fp-header';
  header.textContent = '对话导航';
  floatingPanelEl.appendChild(header);

  floatingListEl = document.createElement('div');
  floatingListEl.className = 'chatnest-fp-list';
  floatingPanelEl.appendChild(floatingListEl);

  const backToTop = document.createElement('button');
  backToTop.className = 'chatnest-fp-backtop';
  backToTop.textContent = '↓ 返回最近提问';
  backToTop.addEventListener('mousedown', () => {
    scrollToTop();
  });
  floatingPanelEl.appendChild(backToTop);

  floatingPanelEl.addEventListener('mouseenter', () => {
    if (collapseTimer) clearTimeout(collapseTimer);
  });

  floatingPanelEl.addEventListener('mouseleave', () => {
    scheduleCollapse();
  });

  document.body.appendChild(floatingPanelEl);
}

function scrollToTop(): void {
  const ctx = findScrollContext();
  if (ctx.container === document.documentElement || ctx.container === document.body) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    (ctx.container as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleFloatingPanel(): void {
  if (state.expanded) {
    collapsePanel();
  } else {
    expandPanel();
  }
}

function expandPanel(): void {
  state.expanded = true;
  if (fabEl) fabEl.classList.remove('chatnest-fab-snapped');
  if (state.mode === 'sidebar' && panelEl) {
    panelEl.classList.add('visible');
    renderPanelList();
  } else if (state.mode === 'floating' && floatingPanelEl) {
    updateFloatingPanelPosition();
    floatingPanelEl.classList.add('visible');
    renderFloatingPanelList();
  }
}

function collapsePanel(): void {
  state.expanded = false;
  if (panelEl) panelEl.classList.remove('visible');
  if (floatingPanelEl) floatingPanelEl.classList.remove('visible');
  if (fabEl) fabEl.classList.add('chatnest-fab-snapped');
}

function scheduleCollapse(): void {
  if (collapseTimer) clearTimeout(collapseTimer);
  collapseTimer = setTimeout(() => {
    collapsePanel();
  }, 800);
}

export function setMessages(messages: UserMessage[]): void {
  debug('setMessages called with', messages.length, 'messages');

  const hash = hashMessages(messages);
  if (hash === lastMessagesHash) {
    // No content change — just update active marker (scroll position may have shifted)
    updateActiveMarker();
    return;
  }
  lastMessagesHash = hash;

  state.messages = messages;
  renderMarkers();
  updateActiveMarker();
  if (state.expanded) {
    if (state.mode === 'sidebar') {
      renderPanelList();
    } else {
      renderFloatingPanelList();
    }
  }
}

function getCumulativeOffsetTop(element: Element, stopAt?: Element): number {
  let top = 0;
  let el: HTMLElement | null = element as HTMLElement;
  while (el && el !== stopAt) {
    top += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  return top;
}

function findScrollContext(): { container: Element; referenceHeight: number; getPosition: (el: Element) => number } {
  // 优先检测内部 scroll 容器（比 document 更精确，避免 column-reverse 布局下 offsetTop 基准错乱）
  let bestContainer: Element | null = null;
  let maxScrollHeight = 0;

  document.querySelectorAll('*').forEach(el => {
    const style = window.getComputedStyle(el);
    if (/auto|scroll|overlay/.test(style.overflowY)) {
      if (el.scrollHeight > el.clientHeight + 10 && el.scrollHeight > maxScrollHeight) {
        maxScrollHeight = el.scrollHeight;
        bestContainer = el;
      }
    }
  });

  if (bestContainer) {
    const container = bestContainer as HTMLElement;
    debug('[findScrollContext] picked inner container:', container.tagName, 'class=', (container as HTMLElement).className?.slice(0, 60), 'scrollHeight=', container.scrollHeight, 'clientHeight=', container.clientHeight);
    return {
      container: container,
      referenceHeight: container.scrollHeight,
      getPosition: (el: Element) => getCumulativeOffsetTop(el, container)
    };
  }

  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;

  if (docHeight > winHeight + 10) {
    debug('[findScrollContext] picked documentElement, scrollHeight=', docHeight, 'winHeight=', winHeight);
    return {
      container: document.documentElement,
      referenceHeight: docHeight,
      getPosition: (el: Element) => getCumulativeOffsetTop(el)
    };
  }

  debug('[findScrollContext] picked body fallback');
  return {
    container: document.body,
    referenceHeight: Math.max(document.body.scrollHeight, winHeight),
    getPosition: (el: Element) => getCumulativeOffsetTop(el)
  };
}

function renderMarkers(): void {
  if (!barEl) {
    debug('renderMarkers: barEl is null!');
    return;
  }

  const existing = barEl.querySelectorAll('.chatnest-marker');
  existing.forEach(el => el.remove());
  markerTops = [];

  debug('renderMarkers: cleared', existing.length, 'old markers');

  if (state.messages.length === 0 || state.mode !== 'sidebar') {
    debug('renderMarkers: no messages to render or not in sidebar mode');
    return;
  }

  const ctx = findScrollContext();
  const barHeight = window.innerHeight;

  debug('renderMarkers: container=', ctx.container.tagName, 'referenceHeight=', ctx.referenceHeight, 'barHeight=', barHeight);

  const positions = state.messages.map(msg => ctx.getPosition(msg.element));
  const negativeCount = positions.filter(p => p < 0).length;
  const isColumnReverse = positions.length > 0 && negativeCount > positions.length / 2;

  // ---- 逐条消息 debug 输出 ----
  console.groupCollapsed('[ChatNest:renderMarkers] per-message debug');
  console.log('isColumnReverse=', isColumnReverse, 'referenceHeight=', ctx.referenceHeight, 'barHeight=', barHeight);
  state.messages.forEach((msg, idx) => {
    const rawPos = positions[idx];
    const elHeight = msg.element.getBoundingClientRect().height || 20;
    let percent: number;
    let position: number;
    if (isColumnReverse) {
      position = ctx.referenceHeight + rawPos + elHeight / 2;
      percent = Math.max(0, Math.min(1, position / ctx.referenceHeight));
    } else {
      position = rawPos;
      percent = Math.max(0, Math.min(1, rawPos / ctx.referenceHeight));
    }
    console.log(
      'msg', idx,
      'id=', msg.id.slice(0, 20),
      '| rawPos=', rawPos.toFixed(1),
      '| elHeight=', elHeight.toFixed(1),
      '| position=', position.toFixed(1),
      '| percent=', percent.toFixed(4),
      '| top=', (percent * barHeight).toFixed(1)
    );
  });
  console.groupEnd();
  // -----------------------------

  // Calculate all marker tops
  const tops = state.messages.map((msg, idx) => {
    let percent: number;
    if (isColumnReverse) {
      const offsetTop = positions[idx];
      const elHeight = msg.element.getBoundingClientRect().height || 20;
      const position = ctx.referenceHeight + offsetTop + elHeight / 2;
      percent = Math.max(0, Math.min(1, position / ctx.referenceHeight));
    } else {
      const pos = positions[idx];
      percent = Math.max(0, Math.min(1, pos / ctx.referenceHeight));
    }
    return percent * barHeight;
  });

  // 限制标记不贴到 bar 边缘，留出 20px 安全边距
  const margin = 20;
  const maxTop = barHeight - margin;
  const reservedTail = 10; // 最后一条标记尾部至少留出 10px 空间
  const effectiveMax = maxTop - reservedTail;

  // 如果最大 top 超出有效范围，整体等比压缩（通常只在消息极多时触发）
  const maxRawTop = Math.max(...tops);
  const scale = maxRawTop > effectiveMax ? effectiveMax / maxRawTop : 1;

  markerTops = tops.map(t => {
    const adjusted = t * scale;
    return Math.max(margin, Math.min(maxTop, adjusted));
  });

  // Create markers with dynamic heights based on spacing
  const minHeight = 6;
  const maxHeight = 14;
  state.messages.forEach((msg, idx) => {
    const marker = document.createElement('div');
    marker.className = 'chatnest-marker';
    marker.dataset.id = msg.id;

    const currentTop = markerTops[idx];
    const nextTop = idx < markerTops.length - 1 ? markerTops[idx + 1] : maxTop;
    const available = nextTop - currentTop;
    const height = Math.max(minHeight, Math.min(available * 0.65, maxHeight));

    marker.style.top = `${currentTop}px`;
    marker.style.height = `${height}px`;

    barEl!.appendChild(marker);
  });

  debug('renderMarkers: rendered', state.messages.length, 'markers');
  updateActiveMarker();
}

function updateActiveMarker(): void {
  let newActiveId: string | null = null;

  for (const msg of state.messages) {
    const rect = msg.element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      newActiveId = msg.id;
      break;
    }
  }

  if (newActiveId !== state.activeId) {
    state.activeId = newActiveId;
    debug('updateActiveMarker: activeId changed to', newActiveId);

    if (barEl) {
      barEl.querySelectorAll('.chatnest-marker').forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.toggle('active', htmlEl.dataset.id === newActiveId);
      });
    }

    if (state.expanded) {
      if (state.mode === 'sidebar') {
        renderPanelList();
      } else {
        renderFloatingPanelList();
      }
    }
  }
}

function renderPanelList(): void {
  if (!listEl) return;
  listEl.innerHTML = '';

  if (state.messages.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:20px;font-size:12px;color:var(--chatnest-text-secondary);text-align:center;';
    empty.textContent = '暂无提问';
    listEl.appendChild(empty);
    return;
  }

  state.messages.forEach((msg, index) => {
    const btn = createListItem(msg, index);
    listEl!.appendChild(btn);
  });
}

function renderFloatingPanelList(): void {
  if (!floatingListEl) return;
  floatingListEl.innerHTML = '';

  if (state.messages.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:20px;font-size:12px;color:var(--chatnest-text-secondary);text-align:center;';
    empty.textContent = '暂无提问';
    floatingListEl.appendChild(empty);
    return;
  }

  state.messages.forEach((msg, index) => {
    const btn = createListItem(msg, index);
    floatingListEl!.appendChild(btn);
  });
}

function createListItem(msg: UserMessage, _index: number): HTMLElement {
  const btn = document.createElement('button');
  btn.className = 'chatnest-item';
  if (msg.id === state.activeId) {
    btn.classList.add('active');
  }

  const dot = document.createElement('span');
  dot.className = 'chatnest-dot';
  btn.appendChild(dot);

  const num = document.createElement('span');
  num.className = 'chatnest-num';
  num.textContent = `${_index + 1}`;
  btn.appendChild(num);

  const text = document.createElement('span');
  text.className = 'chatnest-item-text';
  text.textContent = msg.text.slice(0, 40) || '(空)';
  btn.appendChild(text);

  btn.addEventListener('mousedown', (e) => {
    debug('panel item mousedown, msg.id:', msg.id);
    e.stopPropagation();
    scrollToElement(msg.element);
    collapsePanel();
  });

  btn.addEventListener('mouseenter', () => {
    const rect = btn.getBoundingClientRect();
    showTooltip(msg.text, rect.left, rect.top + rect.height / 2);
  });

  btn.addEventListener('mouseleave', () => {
    hideTooltip();
  });

  return btn;
}

function updateTheme(): void {
  const isDark = detectDarkMode();
  document.body.classList.toggle('chatnest-dark', isDark);
}

export function setVisible(visible: boolean): void {
  state.visible = visible;
  applyMode();
}

export function isVisible(): boolean {
  return state.visible;
}
