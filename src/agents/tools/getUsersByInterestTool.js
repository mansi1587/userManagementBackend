const {
  DynamicStructuredTool,
} = require("@langchain/core/tools");

const { z } = require("zod");

const {
  callMCPTool,
} = require("../../mcp/mcpClient");

const getUsersByInterestTool =
  new DynamicStructuredTool({
    name: "get_users_by_interest",

    description:
      "Get the number of users having a specific area of interest, such as Reading, Writing, or Traveling. Use this tool when the user asks how many users have a particular interest.",

    schema: z.object({
      interest: z
        .string()
        .describe(
          "Area of interest such as Reading, Writing, or Traveling"
        ),
    }),

    func: async ({ interest }) => {

      const result = await callMCPTool(
        "get_users_by_interest",
        {
          interest,
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
  getUsersByInterestTool,
};