import type { ChatNestState } from '../types';

const STORAGE_KEY = 'chatnest_state_v1';

const DEFAULT_STATE: ChatNestState = {
  visible: true,
  enabled: true,
};

export async function getState(): Promise<ChatNestState> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_STATE, ...(result[STORAGE_KEY] || {}) };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function setState(state: Partial<ChatNestState>): Promise<void> {
  try {
    const current = await getState();
    await chrome.storage.local.set({ [STORAGE_KEY]: { ...current, ...state } });
  } catch {
    // Silently fail if storage is not available
  }
}
