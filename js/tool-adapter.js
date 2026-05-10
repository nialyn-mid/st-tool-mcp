import { logger } from './logger.js';

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
        logger.debug(`Found ${stTools.length} tools in ST ToolManager.`);
        return stTools.map(tool => {
            // SillyTavern's ToolDefinition uses private fields for name, description, and parameters.
            // We use toFunctionOpenAI() to get a public representation.
            const func = tool.toFunctionOpenAI()?.function || {};
            return {
                name: func.name || 'unknown',
                description: func.description || '',
                inputSchema: func.parameters || { type: 'object', properties: {} }
            };
        });
    }

    /**
     * Invokes an ST tool and returns the result.
     * @param {string} name 
     * @param {any} args 
     * @returns {Promise<any>}
     */
    async callTool(name, args) {
        if (!this.toolManager) {
            logger.error('ST ToolManager not found during callTool.');
            throw new Error('ST ToolManager not found');
        }

        try {
            logger.info(`Invoking ST tool: ${name}`, args);
            // SillyTavern's invokeFunctionTool returns a string or an Error object
            const result = await this.toolManager.invokeFunctionTool(name, args);
            
            if (result instanceof Error) {
                logger.error(`ST tool ${name} returned an error:`, result);
                return {
                    isError: true,
                    content: [
                        {
                            type: 'text',
                            text: `Tool execution failed: ${result.message}`
                        }
                    ]
                };
            }

            logger.debug(`Tool ${name} returned:`, result);
            return {
                content: [
                    {
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                    }
                ]
            };
        } catch (error) {
            logger.error(`Exception during tool ${name} invocation:`, error);
            return {
                isError: true,
                content: [
                    {
                        type: 'text',
                        text: `Internal Hub Error: ${error.message}`
                    }
                ]
            };
        }
    }
}
