import { detectPlatform } from './platforms';
import { initNavbar, destroyNavbar, setMessages, setVisible, isVisible } from './ui/navbar';
import { getState, setState } from './utils/storage';
import { debounce } from './utils/throttle';

let initialized = false;
let cleanupFns: Array<() => void> = [];
let startPromise: Promise<void> | null = null;

async function start(): Promise<void> {
  console.log('[ChatNest] init started, hostname:', location.hostname);

  const adapter = detectPlatform();
  if (!adapter) {
    console.log('[ChatNest] no adapter matched for', location.hostname);
    return;
  }

  console.log('[ChatNest] adapter matched:', adapter.name);

  const currentAdapter = adapter;
  let state;
  try {
    state = await getState();
  } catch {
    state = { visible: true, enabled: true };
  }

  if (state.enabled === false) {
    console.log('[ChatNest] disabled by user, skipping init');
    return;
  }

  initialized = true;
  initNavbar();
  setVisible(state.visible);

  function updateMessages(): void {
    const messages = currentAdapter.getUserMessages();
    console.log('[ChatNest] found messages:', messages.length);
    if (messages.length === 0) {
      console.log('[ChatNest] no user messages found, container:', currentAdapter.getConversationContainer()?.tagName);
    } else {
      messages.forEach((m, i) => {
        console.log('[ChatNest] msg', i, 'id:', m.id, 'text:', m.text.slice(0, 30));
      });
    }
    setMessages(messages);
  }

  // Initial scan
  updateMessages();

  // Retry polling for SPAs that load content asynchronously
  let retryCount = 0;
  const maxRetries = 15;
  const retryInterval = setInterval(() => {
    retryCount++;
    const messages = currentAdapter.getUserMessages();
    if (messages.length > 0) {
      console.log('[ChatNest] found messages after retry #' + retryCount + ':', messages.length);
      setMessages(messages);
      clearInterval(retryInterval);
    } else if (retryCount >= maxRetries) {
      console.log('[ChatNest] max retries reached, giving up');
      clearInterval(retryInterval);
    }
  }, 1000);

  // MutationObserver for dynamic updates
  const observer = currentAdapter.observeChanges(
    debounce(() => {
      updateMessages();
      // If we finally found messages, stop the retry polling
      const messages = currentAdapter.getUserMessages();
      if (messages.length > 0) {
        clearInterval(retryInterval);
      }
    }, 300)
  );

  // Periodic fallback scan: Shadow DOM mutations are not visible to
  // MutationObservers on document.body, so we poll every 3s as a safety net.
  const periodicScan = setInterval(() => {
    const messages = currentAdapter.getUserMessages();
    console.log('[ChatNest] periodic scan, messages=', messages.length);
    setMessages(messages);
  }, 3000);

  const keyHandler = (e: KeyboardEvent) => {
    if (e.altKey && e.key === 'n') {
      e.preventDefault();
      const newVisible = !isVisible();
      setVisible(newVisible);
      setState({ visible: newVisible });
    }
  };
  document.addEventListener('keydown', keyHandler);

  const beforeUnloadHandler = () => {
    clearInterval(retryInterval);
    clearInterval(periodicScan);
    observer.disconnect();
  };
  window.addEventListener('beforeunload', beforeUnloadHandler);

  cleanupFns = [
    () => clearInterval(retryInterval),
    () => clearInterval(periodicScan),
    () => observer.disconnect(),
    () => document.removeEventListener('keydown', keyHandler),
    () => window.removeEventListener('beforeunload', beforeUnloadHandler),
    () => destroyNavbar(),
  ];
}

function stop(): void {
  console.log('[ChatNest] stopping');
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  initialized = false;
}

function handleEnabledChange(enabled: boolean): void {
  console.log('[ChatNest] enabled changed to', enabled);
  if (enabled && !initialized) {
    if (startPromise) {
      console.log('[ChatNest] start already in progress, skipping');
      return;
    }
    startPromise = start().finally(() => {
      startPromise = null;
    });
  } else if (!enabled && initialized) {
    stop();
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CHATNEST_ENABLED_CHANGED') {
    handleEnabledChange(message.enabled);
  }
});

// 备用机制：监听 storage 变化，确保即使消息发送失败也能响应开关状态
chrome.storage.onChanged.addListener((changes) => {
  if (changes.chatnest_state_v1) {
    const newEnabled = changes.chatnest_state_v1.newValue?.enabled;
    if (typeof newEnabled === 'boolean') {
      handleEnabledChange(newEnabled);
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
