const STORAGE_KEY = 'chatnest_state_v1';

const DEFAULT_STATE = {
  visible: true,
  expanded: false,
  mode: 'sidebar',
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

async function setMode(mode) {
  try {
    const current = await getState();
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...current, mode },
    });

    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'CHATNEST_MODE_CHANGED', mode }).catch(() => {});
      }
    }
  } catch {
    // Silently fail
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
  const currentMode = state.mode || 'sidebar';
  const enabled = state.enabled !== false;

  const btnSidebar = document.getElementById('btn-sidebar');
  const btnFloating = document.getElementById('btn-floating');
  const toggleEnabled = document.getElementById('toggle-enabled');

  function updateUI(mode) {
    btnSidebar.classList.toggle('active', mode === 'sidebar');
    btnFloating.classList.toggle('active', mode === 'floating');
  }

  updateUI(currentMode);

  if (toggleEnabled) {
    toggleEnabled.checked = enabled;
    toggleEnabled.addEventListener('change', () => {
      setEnabled(toggleEnabled.checked);
    });
  }

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
