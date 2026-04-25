import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString } from '../utils/dom';

export const geminiAdapter: PlatformAdapter = {
  name: 'Gemini',
  hostPatterns: ['gemini.google.com'],

  isMatch(): boolean {
    return location.hostname === 'gemini.google.com';
  },

  getConversationContainer(): Element | null {
    return document.querySelector('main') || document.querySelector('chat-window') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const selectors = [
      '[data-test-id="user-message"]',
      '[data-testid="user-message"]',
      '[data-test-id="user-query"]',
      '[data-testid="user-query"]',
      '[data-test-id="query-text"]',
      'div[class*="user-message"]',
      'div[class*="userMessage"]',
      'span[class*="user-query-bubble"]',
      'div[class*="user-query"]',
      'div[class*="userQuery"]',
      '[aria-label="You"]',
      '[aria-label="User"]',
    ];

    const messages: UserMessage[] = [];
    let index = 0;

    for (const selector of selectors) {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        els.forEach(el => {
          if (el.closest('form') || el.closest('[contenteditable="true"]')) return;
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
    // 排除屏幕阅读器辅助文本（如 "You said"）
    const clone = el.cloneNode(true) as Element;
    clone.querySelectorAll('.cdk-visually-hidden, .screen-reader-only, [aria-hidden="true"]').forEach(n => n.remove());
    const textEl = clone.querySelector('p, [class*="text"], div');
    return getTextContent(textEl || clone);
  },

  getMessageId(el: Element): string {
    const msgId = el.getAttribute('data-message-id') ||
      el.getAttribute('data-id') ||
      el.id;
    if (msgId) return `gemini-${msgId}`;
    return `gemini-${hashString(this.extractMessageText(el))}`;
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
