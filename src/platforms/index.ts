import type { PlatformAdapter } from '../types';
import { chatgptAdapter } from './chatgpt';
import { claudeAdapter } from './claude';
import { geminiAdapter } from './gemini';
import { deepseekAdapter } from './deepseek';
import { kimiAdapter } from './kimi';
import { perplexityAdapter } from './perplexity';
import { doubaoAdapter } from './doubao';
import { qwenAdapter } from './qwen';
import { yuanbaoAdapter } from './yuanbao';

const adapters: PlatformAdapter[] = [
  chatgptAdapter,
  claudeAdapter,
  geminiAdapter,
  deepseekAdapter,
  kimiAdapter,
  perplexityAdapter,
  doubaoAdapter,
  qwenAdapter,
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
