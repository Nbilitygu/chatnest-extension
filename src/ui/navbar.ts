import type { UserMessage } from '../types';
import { detectDarkMode, injectStyles } from './styles';
import { showTooltip, hideTooltip } from './tooltip';
import { scrollToElement } from '../utils/scroll';
import { throttle, debounce } from '../utils/throttle';

const SIDEBAR_WRAPPER_ID = 'chatnest-sidebar-wrapper';
const PANEL_ID = 'chatnest-panel';
const LIST_ID = 'chatnest-panel-list';

interface NavbarState {
  visible: boolean;
  messages: UserMessage[];
  activeId: string | null;
}

let sidebarWrapperEl: HTMLElement | null = null;
let panelEl: HTMLElement | null = null;
let listEl: HTMLElement | null = null;
let state: NavbarState = {
  visible: true,
  messages: [],
  activeId: null,
};
let lastMessagesHash = '';

function hashMessages(messages: UserMessage[]): string {
  return messages.map(m => m.id + ':' + m.text.slice(0, 30)).join('|');
}

function debug(...args: unknown[]): void {
  console.log('[ChatNest:navbar]', ...args);
}

export function destroyNavbar(): void {
  document.getElementById(SIDEBAR_WRAPPER_ID)?.remove();
  document.getElementById(PANEL_ID)?.remove();
  document.getElementById('chatnest-tooltip')?.remove();
  document.getElementById('chatnest-styles')?.remove();

  sidebarWrapperEl = null;
  panelEl = null;
  listEl = null;
  state = {
    visible: true,
    messages: [],
    activeId: null,
  };
}

export function initNavbar(): void {
  debug('initNavbar called');

  destroyNavbar();

  injectStyles();
  createSidebarWrapper();
  createPanel();
  updateTheme();

  window.addEventListener('scroll', throttle(updateActiveMarker, 100), true);
  window.addEventListener('resize', debounce(() => {
    renderPanelList();
    updateActiveMarker();
  }, 200));

  const observer = new MutationObserver(debounce(() => {
    updateTheme();
  }, 500));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
}

export function setMessages(messages: UserMessage[]): void {
  debug('setMessages called with', messages.length, 'messages');

  // 为每个元素打上 data-chatnest-id，方便虚拟滚动场景下重新定位
  messages.forEach(msg => {
    try {
      msg.element.setAttribute('data-chatnest-id', msg.id);
      debug('tagged element', msg.id, 'isConnected=', msg.element.isConnected);
    } catch {
      // ignore
    }
  });

  const hash = hashMessages(messages);
  const hasStaleElements = state.messages.some(m => !m.element.isConnected);

  if (hash === lastMessagesHash && !hasStaleElements) {
    debug('hash same, no stale elements, skipping update');
    updateActiveMarker();
    return;
  }
  lastMessagesHash = hash;

  state.messages = messages;
  renderPanelList();
  updateActiveMarker();
}

function updateActiveMarker(): void {
  if (state.activeId !== null) return;

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
    debug('updateActiveMarker: activeId initialized to', newActiveId);
    renderPanelList();
  }
}

function createSidebarWrapper(): void {
  sidebarWrapperEl = document.createElement('div');
  sidebarWrapperEl.id = SIDEBAR_WRAPPER_ID;

  sidebarWrapperEl.addEventListener('mouseleave', () => {
    sidebarWrapperEl?.classList.remove('expanded');
  });

  document.body.appendChild(sidebarWrapperEl);
  debug('sidebar wrapper created');
}

function createPanel(): void {
  panelEl = document.createElement('div');
  panelEl.id = PANEL_ID;

  const contentEl = document.createElement('div');
  contentEl.id = 'chatnest-panel-content';

  const header = document.createElement('div');
  header.id = 'chatnest-panel-header';
  header.textContent = '对话导航';
  contentEl.appendChild(header);

  listEl = document.createElement('div');
  listEl.id = LIST_ID;
  contentEl.appendChild(listEl);

  panelEl.appendChild(contentEl);

  if (sidebarWrapperEl) {
    sidebarWrapperEl.appendChild(panelEl);
  } else {
    document.body.appendChild(panelEl);
  }
  debug('panel created');
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

function createListItem(msg: UserMessage, _index: number): HTMLElement {
  const btn = document.createElement('button');
  btn.className = 'chatnest-item';
  if (msg.id === state.activeId) {
    btn.classList.add('active');
  }

  const text = document.createElement('span');
  text.className = 'chatnest-item-text';
  text.textContent = msg.text.slice(0, 40) || '(空)';
  btn.appendChild(text);

  const marker = document.createElement('span');
  marker.className = 'chatnest-item-marker';
  marker.addEventListener('mouseenter', () => {
    sidebarWrapperEl?.classList.add('expanded');
  });
  btn.appendChild(marker);

  btn.addEventListener('mousedown', (e) => {
    debug('panel item mousedown, msg.id:', msg.id);
    e.stopPropagation();
    state.activeId = msg.id;
    renderPanelList();

    let target = msg.element;
    debug('initial target isConnected=', target.isConnected, 'tagName=', target.tagName);

    if (!target.isConnected) {
      debug('target detached, trying querySelector for data-chatnest-id=', msg.id);
      const fresh = document.querySelector(`[data-chatnest-id="${msg.id}"]`);
      debug('querySelector result=', fresh ? fresh.tagName + ' isConnected=' + fresh.isConnected : 'null');
      if (fresh) {
        target = fresh;
        msg.element = fresh;
      }
    }

    if (target.isConnected) {
      scrollToElement(target);
    } else {
      debug('element no longer in DOM, skipping scroll');
    }
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
  if (sidebarWrapperEl) {
    sidebarWrapperEl.style.display = visible ? 'block' : 'none';
  }
}

export function isVisible(): boolean {
  return state.visible;
}
