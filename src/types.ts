export interface UserMessage {
  id: string;
  text: string;
  element: Element;
  index: number;
}

export interface Marker {
  id: string;
  top: number;
  text: string;
}

export interface PlatformAdapter {
  name: string;
  hostPatterns: string[];
  isMatch(): boolean;
  getConversationContainer(): Element | null;
  getUserMessages(): UserMessage[];
  extractMessageText(el: Element): string;
  getMessageId(el: Element): string;
  observeChanges(callback: () => void): MutationObserver;
}

export interface ChatNestState {
  visible: boolean;
  enabled: boolean;
}
