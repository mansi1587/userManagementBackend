const { z } = require("zod");
const {
  getUsersByInterest,
} = require("../../services/userService");

const registerGetUsersByInterestTool = (server) => {

  server.tool(
    "get_users_by_interest",

    "Get the number of users having a specific area of interest.",

    {
      interest: z
        .string()
        .describe(
          "Area of interest such as Reading, Writing, or Traveling"
        ),
    },

    async ({ interest }) => {

      try {

        console.log(
          `MCP tool called: get_users_by_interest(${interest})`
        );

        const count =
          await getUsersByInterest(interest);

        return {
          content: [
            {
              type: "text",
              text:
                `There are ${count} users interested in ${interest}.`,
            },
          ],
        };

      } catch (error) {

        console.error(
          "MCP get_users_by_interest error:",
          error
        );

        return {
          content: [
            {
              type: "text",
              text:
                "Failed to retrieve users by interest.",
            },
          ],
          isError: true,
        };
      }
    }
  );
};

module.exports = {
  registerGetUsersByInterestTool,
};