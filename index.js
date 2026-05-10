import { McpServer } from './js/mcp-server.js';
import { ToolAdapter } from './js/tool-adapter.js';
import { createTransportPair } from './js/transport.js';

/**
 * SillyTavern MCP Hub Extension
 * Exposes internal tools via the Model Context Protocol.
 */

let serverInstance = null;
let adapterInstance = null;

/**
 * Initializes the Hub.
 */
async function initHub() {
    console.log('[MCP Hub] Initializing...');
    
    // Get ST context
    const context = SillyTavern.getContext();
    
    // Initialize Adapter
    adapterInstance = new ToolAdapter(context);
    
    // Initialize Server
    serverInstance = new McpServer({
        name: 'SillyTavern MCP Hub',
        version: '1.0.0',
        adapter: adapterInstance
    });

    console.log('[MCP Hub] Ready.');
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
});
