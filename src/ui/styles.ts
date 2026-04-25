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

    /* ===== Sidebar Bar ===== */
    #chatnest-bar {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 10px;
      z-index: 9998;
      pointer-events: auto;
      cursor: pointer;
      transition: background 0.25s ease;
      background: transparent;
    }

    #chatnest-bar:hover {
      background: rgba(128, 128, 128, 0.06);
    }

    .chatnest-dark #chatnest-bar:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    /* ===== Markers ===== */
    .chatnest-marker {
      position: absolute;
      right: 1px;
      width: 8px;
      border-radius: 4px;
      background: var(--chatnest-marker);
      opacity: 0.6;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      transform: translateY(-50%);
    }

    .chatnest-marker:hover {
      opacity: 1;
      width: 10px;
      background: var(--chatnest-text-secondary);
    }

    .chatnest-marker.active {
      background: var(--chatnest-marker-active);
      opacity: 1;
      width: 10px;
      box-shadow: 0 0 8px var(--chatnest-marker-active-glow), 0 0 16px var(--chatnest-active-glow);
    }

    .chatnest-dark .chatnest-marker.active {
      box-shadow: 0 0 8px var(--chatnest-marker-active-glow), 0 0 16px rgba(167, 139, 250, 0.3);
    }

    /* ===== Sidebar Panel ===== */
    #chatnest-panel {
      position: fixed;
      right: 10px;
      top: 12px;
      bottom: 12px;
      width: 200px;
      z-index: 9999;
      background: var(--chatnest-bg);
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
      border: 1px solid var(--chatnest-border);
      border-right: none;
      box-shadow: var(--chatnest-shadow);
      border-radius: 12px 0 0 12px;
      display: flex;
      flex-direction: column;
      transform: translateX(calc(100% + 20px));
      transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
    }

    #chatnest-panel.visible {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
    }

    .chatnest-dark #chatnest-panel {
      background: var(--chatnest-bg-dark);
      border-color: var(--chatnest-border-dark);
      box-shadow: var(--chatnest-shadow-dark);
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
      gap: 8px;
      padding: 7px 14px;
      font-size: 12px;
      line-height: 1.4;
      color: var(--chatnest-text);
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: inherit;
      border-radius: 0 6px 6px 0;
      margin-right: 6px;
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

    .chatnest-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--chatnest-marker);
      flex-shrink: 0;
      transition: background 0.2s;
    }

    .chatnest-item.active .chatnest-dot {
      background: var(--chatnest-marker-active);
      box-shadow: 0 0 4px var(--chatnest-active-glow);
    }

    .chatnest-num {
      font-size: 10px;
      font-weight: 500;
      color: var(--chatnest-text-secondary);
      min-width: 16px;
      text-align: center;
      flex-shrink: 0;
    }

    .chatnest-item.active .chatnest-num {
      color: var(--chatnest-active);
    }

    .chatnest-item-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    /* ===== Back to Top ===== */
    #chatnest-back-to-top {
      padding: 10px 16px;
      border-top: 1px solid var(--chatnest-border);
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: var(--chatnest-text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      background: none;
      border-left: none;
      border-right: none;
      border-bottom: none;
      width: 100%;
      font-family: inherit;
    }

    #chatnest-back-to-top:hover {
      background: var(--chatnest-item-hover-bg);
      color: var(--chatnest-active);
    }

    .chatnest-dark #chatnest-back-to-top {
      border-top-color: var(--chatnest-border-dark);
      color: var(--chatnest-text-secondary-dark);
    }

    .chatnest-dark #chatnest-back-to-top:hover {
      background: var(--chatnest-item-hover-bg-dark);
      color: var(--chatnest-active-dark);
    }

    /* ===== FAB (Floating Action Button) ===== */
    #chatnest-fab {
      position: fixed;
      right: 0px;
      width: 40px;
      height: 52px;
      border-radius: 10px 0 0 10px;
      background: var(--chatnest-fab-bg);
      color: white;
      border: none;
      cursor: pointer;
      z-index: 9998;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(124, 58, 237, 0.35), 0 2px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      padding: 0;
    }

    #chatnest-fab:hover {
      background: var(--chatnest-fab-bg-hover);
      box-shadow: 0 6px 24px rgba(124, 58, 237, 0.45), 0 3px 8px rgba(0, 0, 0, 0.12);
    }

    #chatnest-fab:active {
      transform: scale(0.97);
    }

    #chatnest-fab.chatnest-fab-snapped {
      opacity: 0.45;
      background: #94a3b8;
      width: 28px;
    }

    #chatnest-fab.chatnest-fab-snapped:hover {
      opacity: 0.8;
      background: #64748b;
      width: 36px;
    }

    /* ===== Floating Panel ===== */
    #chatnest-floating-panel {
      position: fixed;
      bottom: 88px;
      right: 28px;
      width: 260px;
      max-height: 420px;
      z-index: 9999;
      background: var(--chatnest-bg);
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
      border: 1px solid var(--chatnest-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
      border-radius: 14px;
      display: none;
      flex-direction: column;
      transform: translateY(12px) scale(0.96);
      transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
    }

    #chatnest-floating-panel.visible {
      transform: translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    .chatnest-dark #chatnest-floating-panel {
      background: var(--chatnest-bg-dark);
      border-color: var(--chatnest-border-dark);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .chatnest-fp-header {
      padding: 14px 16px 10px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--chatnest-text-secondary);
      flex-shrink: 0;
      user-select: none;
    }

    .chatnest-dark .chatnest-fp-header {
      color: var(--chatnest-text-secondary-dark);
    }

    .chatnest-fp-list {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
      scrollbar-width: thin;
      scrollbar-color: var(--chatnest-marker) transparent;
    }

    .chatnest-fp-list::-webkit-scrollbar {
      width: 4px;
    }

    .chatnest-fp-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .chatnest-fp-list::-webkit-scrollbar-thumb {
      background: var(--chatnest-marker);
      border-radius: 4px;
    }

    .chatnest-fp-backtop {
      padding: 10px 16px;
      border-top: 1px solid var(--chatnest-border);
      text-align: center;
      font-size: 11px;
      font-weight: 500;
      color: var(--chatnest-text-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
      background: none;
      border-left: none;
      border-right: none;
      border-bottom: none;
      width: 100%;
      font-family: inherit;
    }

    .chatnest-fp-backtop:hover {
      background: var(--chatnest-item-hover-bg);
      color: var(--chatnest-active);
    }

    .chatnest-dark .chatnest-fp-backtop {
      border-top-color: var(--chatnest-border-dark);
      color: var(--chatnest-text-secondary-dark);
    }

    .chatnest-dark .chatnest-fp-backtop:hover {
      background: var(--chatnest-item-hover-bg-dark);
      color: var(--chatnest-active-dark);
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

    /* ===== Animation keyframes for markers ===== */
    @keyframes chatnest-marker-in {
      from {
        opacity: 0;
        transform: translateY(-50%) scale(0.5);
      }
      to {
        opacity: 0.55;
        transform: translateY(-50%) scale(1);
      }
    }

    .chatnest-marker {
      animation: chatnest-marker-in 0.3s ease-out;
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
