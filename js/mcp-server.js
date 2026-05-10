/**
 * A minimal MCP Server implementation for SillyTavern.
 * Handles JSON-RPC 2.0 requests for tool listing and execution.
 */
export class McpServer {
    /**
     * @param {any} options 
     */
    constructor(options) {
        this.name = options.name || 'SillyTavern-MCP-Hub';
        this.version = options.version || '1.0.0';
        this.adapter = options.adapter;
        this.transport = null;
    }

    /**
     * Connects the server to a transport.
     * @param {any} transport 
     */
    async connect(transport) {
        this.transport = transport;
        this.transport.onmessage = (message) => this.handleMessage(message);
        await this.transport.start();
    }

    /**
     * Handles incoming JSON-RPC messages.
     * @param {any} message 
     */
    async handleMessage(message) {
        if (message.jsonrpc !== '2.0') return;

        const { method, params, id } = message;

        try {
            let result;
            switch (method) {
                case 'initialize':
                    result = {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            tools: {}
                        },
                        serverInfo: {
                            name: this.name,
                            version: this.version
                        }
                    };
                    break;
                case 'tools/list':
                    const tools = await this.adapter.getMcpTools();
                    result = { tools };
                    break;
                case 'tools/call':
                    const callResult = await this.adapter.callTool(params.name, params.arguments);
                    result = callResult;
                    break;
                case 'notifications/initialized':
                    return; // Ignore
                default:
                    throw new Error(`Method not found: ${method}`);
            }

            if (id !== undefined) {
                await this.transport.send({
                    jsonrpc: '2.0',
                    id,
                    result
                });
            }
        } catch (error) {
            if (id !== undefined) {
                await this.transport.send({
                    jsonrpc: '2.0',
                    id,
                    error: {
                        code: -32603,
                        message: error.message
                    }
                });
            }
        }
    }
}
