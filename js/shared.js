const storageKeys = {
    settings: 'settings',
    lastSeries: 'lastSeries',
};

const settingsKeys = {
    enabled: 'enabled',
    automaticPlay: 'automatic_play',
};

const aniworldHost = "aniworld";

function getLocalizedKey(setting) {
    let host = window.location.host.split(".")[0];
    return getKey(setting, host.includes(aniworldHost) ? aniworldHost : null);
}

function getKey(setting, prefix = null) {
    if (prefix) {
        return prefix + "." + setting;
    } else {
        return setting;
    }
}

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
