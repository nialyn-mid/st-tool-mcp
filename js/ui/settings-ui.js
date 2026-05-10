import { settings, updateSetting } from '../settings.js';

/**
 * Initializes the settings UI event listeners.
 */
export function initSettingsUI() {
    const $logLevel = $('#mcp-hub-log-level');
    
    // Set initial value
    $logLevel.val(settings.logLevel);
    
    // Bind change event
    $logLevel.on('change', function() {
        const val = parseInt($(this).val());
        updateSetting('logLevel', val);
    });
}
