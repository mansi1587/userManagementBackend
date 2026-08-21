const {
  DynamicStructuredTool,
} = require("@langchain/core/tools");

const { z } = require("zod");

const {
  callMCPTool,
} = require("../../mcp/mcpClient");

const getUsersByStateTool =
  new DynamicStructuredTool({
    name: "get_users_by_state",

    description:
      "Get the number of users belonging to a specific state. Use this tool when the user asks how many users belong to a particular state.",

    schema: z.object({
      stateName: z
        .string()
        .describe("Name of the state"),
    }),

    func: async ({ stateName }) => {

      const result = await callMCPTool(
        "get_users_by_state",
        {
          stateName,
        }
      );

      const text =
        result.content?.find(
          (item) => item.type === "text"
        )?.text;

      return text || "No result found.";
    },
  });
  module.exports = {
    getUsersByStateTool,
  };