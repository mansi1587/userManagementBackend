const {
  Client,
} = require("@modelcontextprotocol/sdk/client/index.js");

const {
  StdioClientTransport,
} = require("@modelcontextprotocol/sdk/client/stdio.js");

let client = null;

const connectMCP = async () => {
  if (client) {
    return client;
  }

  client = new Client(
    {
      name: "user-management-agent",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: "node",
    args: [
      "src/mcp/mcpServer.js",
    ],
  });

  await client.connect(transport);

  console.log("Connected to MCP server");

  return client;
};

const getMCPTools = async () => {
  const mcpClient = await connectMCP();

  const response = await mcpClient.listTools();

  return response.tools;
};

const callMCPTool = async (
  name,
  args
) => {
  const mcpClient = await connectMCP();

  return await mcpClient.callTool({
    name,
    arguments: args,
  });
};

module.exports = {
  connectMCP,
  getMCPTools,
  callMCPTool,
};