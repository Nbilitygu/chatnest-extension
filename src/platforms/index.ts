import type { PlatformAdapter } from '../types';
import { chatgptAdapter } from './chatgpt';
import { geminiAdapter } from './gemini';
import { kimiAdapter } from './kimi';
import { doubaoAdapter } from './doubao';
import { yuanbaoAdapter } from './yuanbao';

const adapters: PlatformAdapter[] = [
  chatgptAdapter,
  geminiAdapter,
  kimiAdapter,
  doubaoAdapter,
  yuanbaoAdapter,
];

export function detectPlatform(): PlatformAdapter | null {
  for (const adapter of adapters) {
    if (adapter.isMatch()) {
      return adapter;
    }
  }
  return null;
}

export { adapters };
