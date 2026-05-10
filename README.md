# MCP Tool Hub

**Note:** This extension is primarily a **developer tool** for enabling inter-extension communication via the Model Context Protocol (MCP).

A SillyTavern extension that exposes extensions' registered agentic tools via the Model Context Protocol (MCP) for stateful inter-extension communication.

> In layman's terms, other extensions register tools? MCP Tool Hub finds them and any other extension that interfaces with it can hand them to LLMs over MCP.

**MCP Tool Hub is NOT accessible to external programs!**

## Features

- **MCP Server:** Implements the MCP specification to allow other extensions to discover and use internal SillyTavern tools.
- **Tool Adapter:** Bridges the generic MCP tool interface to SillyTavern's specific tool execution environment.

## Installation

1. Download the latest release from the [Releases page](https://github.com/nialyn-mid/st-tool-mcp/releases).
2. Extract the zip file into your `extensions` folder (e.g., `SillyTavern/public/scripts/extensions/third-party/st-tool-mcp`).
3. Restart SillyTavern.

## Usage

### For Extension Developers

If you are developing another SillyTavern extension and want to make other extensions' tools available to an MCP client, you can connect to this hub:

```javascript
import { createLocalTransport } from './extensions/third-party/st-tool-mcp/index.js';

// Create a transport to the Hub
const transport = await createLocalTransport();

// Initialize MCP Client (using an existing library or custom implementation)
// const client = new McpClient(transport, {
//     name: 'MyExtension',
//     version: '1.0.0'
// });

// await client.connect();
// const tools = await client.getTools();
// console.log(tools);
```

### For End Users

This extension runs in the background and provides the MCP interface. You can verify it is running by pasting the code from `examples/test-hub.js` into your browser console.

**How to Use the Tools:**

1.  Ensure other extensions that utilize "MCP Client" functionality are installed and enabled.
2.  Use the features provided by those client extensions, which will now be able to access internal tools.