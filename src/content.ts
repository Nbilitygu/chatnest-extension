import { detectPlatform } from './platforms';
import { initNavbar, destroyNavbar, setMessages, setVisible, isVisible, setMode } from './ui/navbar';
import { getState, setState } from './utils/storage';
import { debounce } from './utils/throttle';

let initialized = false;
let cleanupFns: Array<() => void> = [];

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
    state = { visible: true, expanded: false, mode: 'sidebar' as const, enabled: true };
  }

  if (state.enabled === false) {
    console.log('[ChatNest] disabled by user, skipping init');
    return;
  }

  initialized = true;
  initNavbar();
  setVisible(state.visible);
  setMode(state.mode || 'sidebar');

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

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CHATNEST_MODE_CHANGED' && message.mode) {
    console.log('[ChatNest] mode changed to', message.mode);
    if (initialized) {
      setMode(message.mode);
    }
  }
  if (message.type === 'CHATNEST_ENABLED_CHANGED') {
    console.log('[ChatNest] enabled changed to', message.enabled);
    if (message.enabled && !initialized) {
      start();
    } else if (!message.enabled && initialized) {
      stop();
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
