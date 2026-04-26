import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString } from '../utils/dom';

export const yuanbaoAdapter: PlatformAdapter = {
  name: '腾讯元宝',
  hostPatterns: ['yuanbao.tencent.com'],

  isMatch(): boolean {
    return location.hostname === 'yuanbao.tencent.com';
  },

  getConversationContainer(): Element | null {
    return document.querySelector('[class*="chat"], [class*="conversation"], main') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const selectors = [
      '[class*="agent-chat__bubble__content-wrapper"]',
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
    if (msgId) return `yuanbao-${msgId}`;
    return `yuanbao-${hashString(this.extractMessageText(el))}`;
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
