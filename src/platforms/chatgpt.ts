import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString } from '../utils/dom';

export const chatgptAdapter: PlatformAdapter = {
  name: 'ChatGPT',
  hostPatterns: ['chatgpt.com', 'chat.openai.com'],

  isMatch(): boolean {
    const host = location.hostname;
    return this.hostPatterns.some(p => host === p || host.endsWith('.' + p));
  },

  getConversationContainer(): Element | null {
    return document.querySelector('main') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const turns = document.querySelectorAll('[data-testid="conversation-turn"]');
    const messages: UserMessage[] = [];

    turns.forEach((turn, index) => {
      const userEl = turn.querySelector('[data-message-author-role="user"]');
      if (!userEl) return;

      const text = this.extractMessageText(userEl);
      if (!text) return;

      // 使用文本内容元素作为滚动目标，避免外层容器布局偏差
      const textEl = userEl.querySelector('.whitespace-pre-wrap, .text-base, .markdown');

      messages.push({
        id: this.getMessageId(userEl),
        text,
        element: (textEl || userEl) as Element,
        index,
      });
    });

    // Fallback: if no turns found, query all user messages directly
    if (messages.length === 0) {
      const userEls = document.querySelectorAll('[data-message-author-role="user"]');
      userEls.forEach((el, index) => {
        const text = this.extractMessageText(el);
        if (!text) return;
        const textEl = el.querySelector('.whitespace-pre-wrap, .text-base, .markdown');
        messages.push({
          id: this.getMessageId(el),
          text,
          element: (textEl || el) as Element,
          index,
        });
      });
    }

    return messages;
  },

  extractMessageText(el: Element): string {
    const textEl = el.querySelector('.whitespace-pre-wrap, .text-base, .markdown');
    return getTextContent(textEl || el);
  },

  getMessageId(el: Element): string {
    const msgId = el.getAttribute('data-message-id') ||
      el.closest('[data-message-id]')?.getAttribute('data-message-id') ||
      el.getAttribute('data-id') ||
      el.id;
    if (msgId) return `chatgpt-${msgId}`;
    return `chatgpt-${hashString(this.extractMessageText(el))}`;
  },

  observeChanges(callback: () => void): MutationObserver {
    const container = this.getConversationContainer();
    if (!container) {
      return new MutationObserver(() => {});
    }

    const observer = new MutationObserver(() => {
      callback();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return observer;
  },
};
