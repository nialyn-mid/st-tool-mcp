# MCP Tool Hub

**Note:** This extension is primarily a **developer tool** for enabling inter-extension communication via the Model Context Protocol (MCP).

A SillyTavern extension that exposes extensions' registered agentic tools via the Model Context Protocol (MCP) for stateful inter-extension communication.

## Features

- **MCP Server:** Implements the MCP specification to allow other extensions (MCP Clients) to discover and use internal SillyTavern tools.
- **Tool Adapter:** Bridges the generic MCP tool interface to SillyTavern's specific tool execution environment.
- **In-Memory Transport:** Provides a high-performance `InMemoryTransport` for direct communication between extensions running in the same browser context.

## Installation

1. Download the latest release from the [Releases page](https://github.com/nialyn-mid/st-tool-mcp/releases).
2. Extract the zip file into your `extensions` folder (e.g., `extensions/st-tool-mcp`).
3. Restart SillyTavern.

## Usage

### For Extension Developers

If you are developing another SillyTavern extension and need access to internal tools (or other extension's tools), you can connect to this hub:

```javascript
import { createLocalTransport } from './extensions/st-tool-mcp/js/transport.js';

// Create a transport to the Hub
const { clientTransport } = createLocalTransport();

// Initialize MCP Client (using an existing library or custom implementation)
// const client = new McpClient(clientTransport, {
//     name: 'MyExtension',
//     version: '1.0.0'
// });

// await client.connect();
// const tools = await client.getTools();
// console.log(tools);
```

### For End Users

This extension runs in the background and provides the MCP interface.

**How to Use the Tools:**

1.  Ensure other "Extension MCP Client" extensions are installed and enabled.
2.  Use the features provided by those client extensions, which will now be able to access internal tools.

## Development

To contribute to this extension, you can run it locally:

```bash
# Initialize the project
.\[Init-Extension.ps1](file:///F:/Fun/Dev/st-extensions/init-extension.ps1)

# Link to your SillyTavern installation
.\init-extension.ps1 -Link

# Or run in "Hot-Reload" mode
.\init-extension.ps1 -HotReload
```

## License

MIT
