import { logger } from './js/logger.js';
import { loadSettings, initSettingsUI } from './js/settings.js';
import { McpServer } from './js/mcp-server.js';
import { ToolAdapter } from './js/tool-adapter.js';
import { createTransportPair } from './js/transport.js';

/**
 * MCP Tool Hub Extension
 * Exposes internal tools via the Model Context Protocol.
 */

let serverInstance = null;
let adapterInstance = null;

/**
 * Initializes the Hub.
 */
async function initHub() {
    logger.info('Initializing Hub...');

    // Load settings
    loadSettings();

    // Get ST context
    const context = SillyTavern.getContext();

    // Initialize Adapter
    adapterInstance = new ToolAdapter(context);

    // Initialize Server
    serverInstance = new McpServer({
        name: 'MCP Tool Hub',
        version: '1.0.0',
        adapter: adapterInstance
    });

    logger.info('Hub initialized and ready.');
}

/**
 * Initializes the settings UI.
 */
async function initUI() {
    const extensionPath = import.meta.url.replace('/index.js', '');
    const settingsHtmlPath = `${extensionPath}/html/settings.html`;

    try {
        const response = await fetch(settingsHtmlPath);
        if (!response.ok) throw new Error(`Failed to load settings HTML: ${response.statusText}`);

        const html = await response.text();
        $('#extensions_settings').append(html);

        // Link logic to UI
        initSettingsUI();
    } catch (err) {
        logger.error('Failed to initialize UI:', err);
    }
}

/**
 * Factory function for other extensions to connect to the Hub.
 * Returns a client-side transport connected to the Hub's server-side transport.
 * 
 * @returns {InMemoryTransport}
 */
export async function createLocalTransport() {
    if (!serverInstance) {
        await initHub();
    }

    const { serverTransport, clientTransport } = createTransportPair();
    await serverInstance.connect(serverTransport);

    return clientTransport;
}

// Auto-initialize when the extension is loaded
jQuery(async () => {
    await initHub();
    await initUI();
});
