  const {
  DynamicStructuredTool,
} = require("@langchain/core/tools");

const { z } = require("zod");

const {
  callMCPTool,
} = require("../../mcp/mcpClient");

  const getUsersByRoleTool =
  new DynamicStructuredTool({
    name: "get_users_by_role",

    description:
      "Get the number of users having a specific role such as Admin or User.",

    schema: z.object({
      role: z
        .string()
        .describe(
          "User role such as Admin or User"
        ),
    }),

    func: async ({ role }) => {

      const result =
        await callMCPTool(
          "get_users_by_role",
          {
            role,
          }
        );

      const text =
        result.content?.find(
          (item) =>
            item.type === "text"
        )?.text;

      return text || "No result found.";
    },
  });

  module.exports = {
    getUsersByRoleTool,
  };