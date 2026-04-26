const STORAGE_KEY = 'chatnest_state_v1';

const DEFAULT_STATE = {
  visible: true,
  enabled: true,
};

async function getState() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_STATE, ...(result[STORAGE_KEY] || {}) };
  } catch {
    return DEFAULT_STATE;
  }
}

async function setEnabled(enabled) {
  try {
    const current = await getState();
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...current, enabled },
    });

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'CHATNEST_ENABLED_CHANGED', enabled }).catch(() => {});
      }
    }
  } catch {
    // Silently fail
  }
}

async function init() {
  const state = await getState();
  const enabled = state.enabled !== false;

  const btnSidebar = document.getElementById('btn-sidebar');
  const toggleEnabled = document.getElementById('toggle-enabled');

  if (btnSidebar) {
    btnSidebar.classList.add('active');
  }

  if (toggleEnabled) {
    toggleEnabled.checked = enabled;
    toggleEnabled.addEventListener('change', () => {
      setEnabled(toggleEnabled.checked);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
