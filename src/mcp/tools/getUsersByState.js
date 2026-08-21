// getUsersByState.js
const { z } = require("zod");
const { getUsersByState } =
  require("../../services/userService");

const registerGetUsersByStateTool = (server) => {

server.tool(
  "get_users_by_state",

  "Get the number of users belonging to a specific state.",

  {
    stateName: z
      .string()
      .describe("Name of the state, for example Madhya Pradesh"),
  },

  async ({ stateName }) => {
    try {
      console.error(
        `MCP tool called: get_users_by_state(${stateName})`
      );

      const result = await getUsersByState(stateName);

      if (result.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `State "${stateName}" was not found.`,
            },
          ],
        };
      }

      const state = result[0];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              state: state.state,
              userCount: state.user_count,
            }),
          },
        ],
      };
    } catch (error) {
      console.error(
        "MCP get_users_by_state error:",
        error
      );

      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve users by state.",
          },
        ],
        isError: true,
      };
    }
  }
);
};

module.exports = {
  registerGetUsersByStateTool,
};