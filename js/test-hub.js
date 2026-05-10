/**
 * SillyTavern MCP Hub - Verification Script
 * Paste this into the browser console to test the MCP connection.
 */

(async () => {
    console.log('%c[MCP Tester] Starting verification...', 'color: cyan; font-weight: bold;');

    try {
        // 1. Import the Hub
        const hubPath = '/scripts/extensions/third-party/st-tool-mcp/index.js';
        console.log(`[MCP Tester] Importing Hub from ${hubPath}...`);
        const hub = await import(hubPath);

        // 2. Create a transport
        console.log('[MCP Tester] Creating transport...');
        const transport = await hub.createLocalTransport();

        // 3. Define a simple helper to send JSON-RPC requests
        let nextId = 1;
        const sendRequest = (method, params = {}) => {
            return new Promise((resolve, reject) => {
                const id = nextId++;
                const timeout = setTimeout(() => reject(new Error(`Request ${id} timed out`)), 5000);
                
                const originalOnMessage = transport.onmessage;
                transport.onmessage = (message) => {
                    if (message.id === id) {
                        clearTimeout(timeout);
                        transport.onmessage = originalOnMessage;
                        if (message.error) reject(message.error);
                        else resolve(message.result);
                    }
                };

                transport.send({
                    jsonrpc: '2.0',
                    id,
                    method,
                    params
                });
            });
        };

        // 4. Initialize
        console.log('[MCP Tester] Initializing session...');
        const initResult = await sendRequest('initialize', {});
        console.log('[MCP Tester] Server Info:', initResult.serverInfo);

        // 5. List Tools
        console.log('[MCP Tester] Listing tools...');
        const toolsResult = await sendRequest('tools/list', {});
        console.log(`[MCP Tester] Found ${toolsResult.tools.length} tools:`, toolsResult.tools.map(t => t.name));

        if (toolsResult.tools.length > 0) {
            console.log('%c[MCP Tester] SUCCESS: Tools retrieved via MCP!', 'color: green; font-weight: bold;');
        } else {
            console.log('%c[MCP Tester] WARNING: Connection successful, but no tools found in ST.', 'color: orange; font-weight: bold;');
        }

    } catch (error) {
        console.error('%c[MCP Tester] FAILED:', 'color: red; font-weight: bold;', error);
    }
})();
