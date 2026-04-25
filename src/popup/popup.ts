const STORAGE_KEY = 'chatnest_state_v1';

type DisplayMode = 'sidebar' | 'floating';

interface ChatNestState {
  visible: boolean;
  expanded: boolean;
  mode?: DisplayMode;
}

const DEFAULT_STATE: ChatNestState = {
  visible: true,
  expanded: false,
  mode: 'sidebar',
};

async function getState(): Promise<ChatNestState> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_STATE, ...(result[STORAGE_KEY] || {}) };
  } catch {
    return DEFAULT_STATE;
  }
}

async function setMode(mode: DisplayMode): Promise<void> {
  try {
    const current = await getState();
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...current, mode },
    });

    // Notify all tabs to update
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'CHATNEST_MODE_CHANGED', mode }).catch(() => {
          // Tab may not have content script, ignore
        });
      }
    }
  } catch {
    // Silently fail
  }
}

async function init(): Promise<void> {
  const state = await getState();
  const currentMode = state.mode || 'sidebar';

  const btnSidebar = document.getElementById('btn-sidebar') as HTMLButtonElement;
  const btnFloating = document.getElementById('btn-floating') as HTMLButtonElement;

  function updateUI(mode: DisplayMode): void {
    btnSidebar.classList.toggle('active', mode === 'sidebar');
    btnFloating.classList.toggle('active', mode === 'floating');
  }

  updateUI(currentMode);

  btnSidebar.addEventListener('click', () => {
    setMode('sidebar');
    updateUI('sidebar');
  });

  btnFloating.addEventListener('click', () => {
    setMode('floating');
    updateUI('floating');
  });
}

document.addEventListener('DOMContentLoaded', init);
