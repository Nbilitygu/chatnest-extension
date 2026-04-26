const STYLE_ID = 'chatnest-styles';

export function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    :root {
      --chatnest-bg: rgba(255, 255, 255, 0.96);
      --chatnest-bg-dark: rgba(28, 32, 40, 0.96);
      --chatnest-text: #334155;
      --chatnest-text-dark: #c9d1d9;
      --chatnest-text-secondary: #94a3b8;
      --chatnest-text-secondary-dark: #6e7681;
      --chatnest-text-hover: #0f172a;
      --chatnest-text-hover-dark: #f0f6fc;
      --chatnest-active: #7c3aed;
      --chatnest-active-dark: #a78bfa;
      --chatnest-active-glow: rgba(124, 58, 237, 0.35);
      --chatnest-marker: #94a3b8;
      --chatnest-marker-active: #7c3aed;
      --chatnest-marker-active-glow: rgba(124, 58, 237, 0.5);
      --chatnest-border: rgba(0, 0, 0, 0.06);
      --chatnest-border-dark: rgba(255, 255, 255, 0.08);
      --chatnest-shadow: -8px 0 32px rgba(0, 0, 0, 0.08), -2px 0 8px rgba(0, 0, 0, 0.04);
      --chatnest-shadow-dark: -8px 0 32px rgba(0, 0, 0, 0.25), -2px 0 8px rgba(0, 0, 0, 0.15);
      --chatnest-tooltip-bg: rgba(15, 23, 42, 0.93);
      --chatnest-fab-bg: #7c3aed;
      --chatnest-fab-bg-hover: #6d28d9;
      --chatnest-item-hover-bg: rgba(124, 58, 237, 0.06);
      --chatnest-item-hover-bg-dark: rgba(167, 139, 250, 0.08);
    }

    /* ===== Sidebar Wrapper (DeepSeek style fade-in/out) ===== */
    #chatnest-sidebar-wrapper {
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 240px;
      height: 340px;
      z-index: 9998;
      overflow: hidden;
      border-radius: 12px;
      background: transparent;
      border: 1px solid transparent;
      box-shadow: none;
      box-sizing: border-box;
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      pointer-events: none;
      transition: background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, backdrop-filter 0.25s ease;
    }

    #chatnest-sidebar-wrapper.expanded {
      pointer-events: auto;
      background: var(--chatnest-bg);
      border-color: var(--chatnest-border);
      box-shadow: var(--chatnest-shadow);
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
    }

    .chatnest-dark #chatnest-sidebar-wrapper.expanded {
      background: var(--chatnest-bg-dark);
      border-color: var(--chatnest-border-dark);
      box-shadow: var(--chatnest-shadow-dark);
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
    }

    /* ===== Sidebar Panel (inner layout container) ===== */
    #chatnest-panel {
      position: relative;
      width: 240px;
      height: 100%;
    }

    /* ===== Panel Content ===== */
    #chatnest-panel-content {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 212px;
      display: flex;
      flex-direction: column;
      pointer-events: none;
    }

    #chatnest-sidebar-wrapper.expanded #chatnest-panel-content {
      pointer-events: auto;
    }

    #chatnest-panel-header {
      padding: 14px 16px 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--chatnest-text-secondary);
      flex-shrink: 0;
      user-select: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    #chatnest-sidebar-wrapper.expanded #chatnest-panel-header {
      opacity: 1;
    }

    .chatnest-dark #chatnest-panel-header {
      color: var(--chatnest-text-secondary-dark);
    }

    #chatnest-panel-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
      scrollbar-width: thin;
      scrollbar-color: var(--chatnest-marker) transparent;
    }

    #chatnest-panel-list::-webkit-scrollbar {
      width: 4px;
    }

    #chatnest-panel-list::-webkit-scrollbar-track {
      background: transparent;
    }

    #chatnest-panel-list::-webkit-scrollbar-thumb {
      background: var(--chatnest-marker);
      border-radius: 4px;
    }

    #chatnest-panel-list::-webkit-scrollbar-thumb:hover {
      background: var(--chatnest-text-secondary);
    }

    /* ===== List Items ===== */
    .chatnest-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 14px;
      font-size: 12px;
      height: 32px;
      color: var(--chatnest-text);
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      border-radius: 6px 0 0 6px;
      pointer-events: none;
    }

    #chatnest-sidebar-wrapper.expanded .chatnest-item {
      pointer-events: auto;
    }

    .chatnest-item:hover {
      background: var(--chatnest-item-hover-bg);
      color: var(--chatnest-text-hover);
    }

    .chatnest-item.active {
      color: var(--chatnest-active);
      font-weight: 600;
      background: var(--chatnest-item-hover-bg);
    }

    .chatnest-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2.5px;
      height: 18px;
      background: var(--chatnest-active);
      border-radius: 0 3px 3px 0;
    }

    .chatnest-dark .chatnest-item {
      color: var(--chatnest-text-dark);
    }

    .chatnest-dark .chatnest-item:hover {
      background: var(--chatnest-item-hover-bg-dark);
      color: var(--chatnest-text-hover-dark);
    }

    .chatnest-dark .chatnest-item.active {
      color: var(--chatnest-active-dark);
      background: var(--chatnest-item-hover-bg-dark);
    }

    .chatnest-dark .chatnest-item.active::before {
      background: var(--chatnest-active-dark);
    }

    /* 默认状态（sidebar 未 hover）：隐藏所有列表项背景和 active 竖线 */
    #chatnest-sidebar-wrapper:not(.expanded) .chatnest-item {
      background: none;
    }

    #chatnest-sidebar-wrapper:not(.expanded) .chatnest-item.active::before {
      display: none;
    }

    .chatnest-item-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    #chatnest-sidebar-wrapper.expanded .chatnest-item-text {
      opacity: 1;
    }

    .chatnest-item-marker {
      width: 28px;
      height: 32px;
      flex-shrink: 0;
      margin-left: 0;
      position: relative;
      pointer-events: auto;
      cursor: pointer;
      background: transparent;
    }

    .chatnest-item-marker::after {
      content: '';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 12px;
      height: 2px;
      border-radius: 1px;
      background: var(--chatnest-marker);
      opacity: 0.7;
      transition: opacity 0.2s ease, background 0.2s ease;
    }

    #chatnest-sidebar-wrapper.expanded .chatnest-item-marker::after {
      opacity: 1;
    }

    .chatnest-item.active .chatnest-item-marker::after {
      background: var(--chatnest-marker-active);
      box-shadow: 0 0 4px var(--chatnest-active-glow);
      opacity: 1;
    }

    /* ===== Tooltip ===== */
    #chatnest-tooltip {
      position: fixed;
      z-index: 10000;
      background: var(--chatnest-tooltip-bg);
      color: white;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 12.5px;
      line-height: 1.55;
      max-width: 320px;
      max-height: 60vh;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.18s ease;
      word-break: break-word;
      backdrop-filter: blur(4px);
    }

    #chatnest-tooltip.visible {
      opacity: 1;
    }

  `;

  document.head.appendChild(style);
}

export function detectDarkMode(): boolean {
  const html = document.documentElement;
  const bg = getComputedStyle(html).backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    const rgb = bg.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      return brightness < 128;
    }
  }

  const body = document.body;
  const bodyBg = getComputedStyle(body).backgroundColor;
  if (bodyBg && bodyBg !== 'rgba(0, 0, 0, 0)' && bodyBg !== 'transparent') {
    const rgb = bodyBg.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
      return brightness < 128;
    }
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
