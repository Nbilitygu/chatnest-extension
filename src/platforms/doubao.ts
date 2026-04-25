import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString, queryAllShadowDOM } from '../utils/dom';

export const doubaoAdapter: PlatformAdapter = {
  name: '豆包',
  hostPatterns: ['doubao.com', 'www.doubao.com'],

  isMatch(): boolean {
    const host = location.hostname;
    return host === 'doubao.com' || host === 'www.doubao.com';
  },

  getConversationContainer(): Element | null {
    return document.querySelector('[class*="chat"], [class*="conversation"], main') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const selectors = [
      // Doubao specific: exact class patterns from actual DOM
      '[class*="bg-g-send-msg-bubble-bg"]',
      '[class*="send-msg-bubble"]',
      // Generic fallbacks
      '[data-testid="user-message"]',
      '[class*="user-message"]',
      '[class*="human-message"]',
      '[role="user"]',
    ];

    const messages: UserMessage[] = [];
    let index = 0;

    for (const selector of selectors) {
      try {
        // Query both light DOM and shadow DOM
        const els = queryAllShadowDOM(document, selector);
        if (els.length > 0) {
          els.forEach(el => {
            // Skip if element is too small (likely not a real message)
            if (el.textContent && el.textContent.length < 2) return;
            // Skip if inside a form or input area
            if (el.closest('form, input, textarea, [contenteditable="true"]')) return;

            const text = this.extractMessageText(el);
            if (!text || text.length < 2) return;

            messages.push({
              id: this.getMessageId(el),
              text,
              element: el,
              index: index++,
            });
          });
          if (messages.length > 0) break;
        }
      } catch {
        // Invalid selector, skip
      }
    }

    return messages;
  },

  extractMessageText(el: Element): string {
    const textEl = el.querySelector('p, pre, [class*="content"], div');
    return getTextContent(textEl || el);
  },

  getMessageId(el: Element): string {
    const msgId = el.getAttribute('data-message-id') ||
      el.getAttribute('data-id') ||
      el.id;
    if (msgId) return `doubao-${msgId}`;
    return `doubao-${hashString(this.extractMessageText(el))}`;
  },

  observeChanges(callback: () => void): MutationObserver {
    const container = this.getConversationContainer();
    if (!container) {
      return new MutationObserver(() => {});
    }

    const observer = new MutationObserver(callback);
    observer.observe(container, { childList: true, subtree: true });
    return observer;
  },
};
