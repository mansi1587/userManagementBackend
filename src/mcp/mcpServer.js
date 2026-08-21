require("dotenv").config();

const {
  McpServer,
} = require("@modelcontextprotocol/sdk/server/mcp.js");

const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");

const {
  registerGetUsersByStateTool
} = require("./tools/getUsersByState");

const {
  registerGetUsersByRoleTool
} = require("./tools/getUsersByRole");

const {
  registerGetUsersByInterestTool
} = require("./tools/getUsersByInterest");





const server = new McpServer({
  name: "user-management-mcp",
  version: "1.0.0",
});

// ==========================================
// Tool: Get users by state
// ==========================================

// server.tool(
//   "get_users_by_state",

//   "Get the number of users belonging to a specific state.",

//   {
//     stateName: z
//       .string()
//       .describe("Name of the state, for example Madhya Pradesh"),
//   },

//   async ({ stateName }) => {
//     try {
//       console.error(
//         `MCP tool called: get_users_by_state(${stateName})`
//       );

//       const result = await getUsersByState(stateName);

//       if (result.length === 0) {
//         return {
//           content: [
//             {
//               type: "text",
//               text: `State "${stateName}" was not found.`,
//             },
//           ],
//         };
//       }

//       const state = result[0];

//       return {
//         content: [
//           {
//             type: "text",
//             text: JSON.stringify({
//               state: state.state,
//               userCount: state.user_count,
//             }),
//           },
//         ],
//       };
//     } catch (error) {
//       console.error(
//         "MCP get_users_by_state error:",
//         error
//       );

//       return {
//         content: [
//           {
//             type: "text",
//             text: "Failed to retrieve users by state.",
//           },
//         ],
//         isError: true,
//       };
//     }
//   }
// );

// server.tool(
//   "get_users_by_role",

//   "Get the number of users having a specific role such as Admin or User.",

//   {
//     role: z
//       .string()
//       .describe("User role, for example Admin or User"),
//   },

//   async ({ role }) => {
//     try {
//       console.error(
//         `MCP tool called: get_users_by_role(${role})`
//       );

//       const result =
//         await getUsersByRole(role);

//       if (result.length === 0) {
//         return {
//           content: [
//             {
//               type: "text",
//               text: `No users found with role "${role}".`,
//             },
//           ],
//         };
//       }

//       const data = result[0];

//       return {
//         content: [
//           {
//             type: "text",
//             text: JSON.stringify({
//               role: data.role,
//               userCount: data.user_count,
//             }),
//           },
//         ],
//       };
//     } catch (error) {
//       console.error(
//         "MCP get_users_by_role error:",
//         error
//       );

//       return {
//         content: [
//           {
//             type: "text",
//             text: "Failed to retrieve users by role.",
//           },
//         ],
//         isError: true,
//       };
//     }
//   }
// );

registerGetUsersByStateTool(server);
registerGetUsersByRoleTool(server);
registerGetUsersByInterestTool(server);
// ==========================================
// Start MCP Server
// ==========================================

const startServer = async () => {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error(
    "User Management MCP Server started"
  );
};

startServer().catch((error) => {
  console.error(
    "Failed to start MCP server:",
    error
  );

  process.exit(1);
});