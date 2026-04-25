import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString } from '../utils/dom';

export const claudeAdapter: PlatformAdapter = {
  name: 'Claude',
  hostPatterns: ['claude.ai'],

  isMatch(): boolean {
    return location.hostname === 'claude.ai';
  },

  getConversationContainer(): Element | null {
    return document.querySelector('[class*="conversation"], [class*="chat"], main') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const selectors = [
      '[data-testid="user-message"]',
      '[data-testid="human-message"]',
      '.font-user-message',
      '.human-message',
      '[class*="human-turn"]',
      '[class*="user-turn"]',
      '[class*="human"]',
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
        break;
      }
    }

    return messages;
  },

  extractMessageText(el: Element): string {
    const textEl = el.querySelector('p, [class*="text"], div');
    return getTextContent(textEl || el);
  },

  getMessageId(el: Element): string {
    const msgId = el.getAttribute('data-message-id') ||
      el.getAttribute('data-testid') ||
      el.id;
    if (msgId) return `claude-${msgId}`;
    return `claude-${hashString(this.extractMessageText(el))}`;
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
