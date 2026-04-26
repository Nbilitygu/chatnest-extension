import type { PlatformAdapter, UserMessage } from '../types';
import { getTextContent, hashString } from '../utils/dom';

export const deepseekAdapter: PlatformAdapter = {
  name: 'DeepSeek',
  hostPatterns: ['chat.deepseek.com'],

  isMatch(): boolean {
    return location.hostname === 'chat.deepseek.com';
  },

  getConversationContainer(): Element | null {
    return document.querySelector('[class*="chat"], [class*="conversation"], main') || document.body;
  },

  getUserMessages(): UserMessage[] {
    const messages: UserMessage[] = [];
    const els = document.querySelectorAll('div[class*="ds-message"]');

    els.forEach((el) => {
      const text = this.extractMessageText(el);
      if (!text) return;
      // DeepSeek 中 AI 回复文本以 "已思考" 开头，排除
      if (text.startsWith('已思考') || text.startsWith('已深度思考')) return;
      messages.push({
        id: this.getMessageId(el),
        text,
        element: el,
        index: messages.length,
      });
    });

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
    if (msgId) return `deepseek-${msgId}`;
    return `deepseek-${hashString(this.extractMessageText(el))}`;
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
