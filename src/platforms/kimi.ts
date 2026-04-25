import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString } from '../utils/dom';

export const kimiAdapter: PlatformAdapter = {
  name: 'Kimi',
  hostPatterns: ['kimi.com', 'kimi.moonshot.cn'],

  isMatch(): boolean {
    const host = location.hostname;
    return host === 'kimi.com' || host === 'kimi.moonshot.cn';
  },

  getConversationContainer(): Element | null {
    return document.querySelector('[class*="chat"], [class*="conversation"], main') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const selectors = [
      '[data-testid="user-message"]',
      '[class*="user-message"]',
      '[class*="userMessage"]',
      '[class*="human-message"]',
      '[class*="humanMessage"]',
      '[class*="question"]',
      '[role="user"]',
    ];

    const messages: UserMessage[] = [];
    let index = 0;

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        els.forEach(el => {
          const text = this.extractMessageText(el);
          if (!text) return;
          messages.push({
            id: this.getMessageId(el),
            text,
            element: el,
            index: index++,
          });
        });
        if (messages.length > 0) break;
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
    if (msgId) return `kimi-${msgId}`;
    return `kimi-${hashString(this.extractMessageText(el))}`;
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
