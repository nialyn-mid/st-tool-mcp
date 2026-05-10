import { logger, setLogLevel } from './logger.js';

export const MODULE_NAME = 'st-tool-mcp';

export const defaultSettings = {
    logLevel: 2, // INFO
};

export let settings = JSON.parse(JSON.stringify(defaultSettings));

/**
 * Loads settings from SillyTavern extension settings.
 */
export function loadSettings() {
    const context = SillyTavern.getContext();
    const storedSettings = context.extensionSettings[MODULE_NAME];
    
    if (storedSettings) {
        settings = Object.assign(settings, storedSettings);
    }
    
    setLogLevel(settings.logLevel);
    logger.debug('Settings loaded:', settings);
}

/**
 * Saves current settings to SillyTavern extension settings.
 */
export function saveSettings() {
    const context = SillyTavern.getContext();
    context.extensionSettings[MODULE_NAME] = settings;
    
    if (typeof context.saveSettingsDebounced === 'function') {
        context.saveSettingsDebounced();
    } else if (typeof context.saveSettings === 'function') {
        context.saveSettings();
    }
    
    logger.debug('Settings saved:', settings);
}

/**
 * Updates a specific setting and saves.
 * @param {string} key 
 * @param {any} value 
 */
export function updateSetting(key, value) {
    settings[key] = value;
    if (key === 'logLevel') {
        setLogLevel(value);
    }
    saveSettings();
}

export { initSettingsUI } from './ui/settings-ui.js';
