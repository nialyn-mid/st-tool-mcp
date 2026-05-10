/**
 * Bridges SillyTavern's ToolManager to MCP Tool format.
 */
export class ToolAdapter {
    /**
     * @param {any} context SillyTavern context
     */
    constructor(context) {
        this.context = context;
    }

    /**
     * Returns the ToolManager instance from ST context.
     */
    get toolManager() {
        return this.context.ToolManager;
    }

    /**
     * Maps all registered ST tools to MCP tool definitions.
     * @returns {Promise<any[]>}
     */
    async getMcpTools() {
        const stTools = this.toolManager?.tools || [];
        return stTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.parameters || { type: 'object', properties: {} }
        }));
    }

    /**
     * Invokes an ST tool and returns the result.
     * @param {string} name 
     * @param {any} args 
     * @returns {Promise<any>}
     */
    async callTool(name, args) {
        if (!this.toolManager) {
            throw new Error('ST ToolManager not found');
        }

        try {
            // SillyTavern's invokeFunctionTool returns a string or a Promise of a string
            const result = await this.toolManager.invokeFunctionTool(name, args);
            return {
                content: [
                    {
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Error invoking tool ${name}: ${error.message}`
                    }
                ]
            };
        }
    }
}
