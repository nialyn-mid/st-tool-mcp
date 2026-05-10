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
            const funcDef = tool.toFunctionOpenAI()?.function || {};
            const name = funcDef.name || 'unknown';
            const parameters = funcDef.parameters;

            // Schema Validation Warnings
            if (!parameters || Object.keys(parameters).length === 0) {
                logger.warn(`Tool "${name}" has no parameter schema defined. The LLM will call it with no arguments.`);
            } else if (parameters.type === 'object' && (!parameters.properties || Object.keys(parameters.properties).length === 0)) {
                logger.warn(`Tool "${name}" has an empty "properties" object in its schema. The LLM will likely omit arguments.`);
            } else if (parameters.type === 'object' && (!parameters.required || parameters.required.length === 0)) {
                logger.warn(`Tool "${name}" defines properties but has no "required" fields. Models may call this with no arguments first.`);
            }

            return {
                name: name,
                description: funcDef.description || '',
                inputSchema: parameters || { type: 'object', properties: {} }
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
            
            // Runtime Warning for empty arguments
            const toolDef = this.toolManager?.tools.find(t => t.toFunctionOpenAI()?.function?.name === name);
            const schema = toolDef?.toFunctionOpenAI()?.function?.parameters;
            if (schema?.properties && Object.keys(schema.properties).length > 0 && (!args || Object.keys(args).length === 0)) {
                logger.warn(`Tool "${name}" was called with empty arguments, but its schema defines required properties. This usually indicates an LLM hallucination or a Client-side formatting error.`);
            }

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
