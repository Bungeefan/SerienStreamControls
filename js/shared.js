const storageKeys = {
    settings: 'settings',
    lastSeries: 'lastSeries',
};

const settingsKeys = {
    enabled: 'enabled',
    automaticPlay: 'automatic_play',
};

function getStorage() {
    return chrome.storage.sync;
}

function initializeSettings(settings) {
    let changed = false;

    if (settings === undefined) {
        settings = {};
        changed = true;
    }

    if (settings[settingsKeys.enabled] === undefined) {
        changed = true;
        settings[settingsKeys.enabled] = true;
    }
    if (settings[settingsKeys.automaticPlay] === undefined) {
        changed = true;
        settings[settingsKeys.automaticPlay] = true;
    }

    if (changed) {
        let storageUpdate = {};
        storageUpdate[storageKeys.settings] = settings;
        getStorage().set(storageUpdate);
    }
    return settings;
}
