const { z } = require("zod");
const {getUsersByRole} = require("../../services/userService");
const registerGetUsersByRoleTool = (server) => {
    server.tool(
      "get_users_by_role",
    
      "Get the number of users having a specific role such as Admin or User.",
    
      {
        role: z
          .string()
          .describe("User role, for example Admin or User"),
      },
    
      async ({ role }) => {
        try {
          console.error(
            `MCP tool called: get_users_by_role(${role})`
          );
    
          const result =
            await getUsersByRole(role);
    
          if (result.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No users found with role "${role}".`,
                },
              ],
            };
          }
    
          const data = result[0];
    
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  role: data.role,
                  userCount: data.user_count,
                }),
              },
            ],
          };
        } catch (error) {
          console.error(
            "MCP get_users_by_role error:",
            error
          );
    
          return {
            content: [
              {
                type: "text",
                text: "Failed to retrieve users by role.",
              },
            ],
            isError: true,
          };
        }
      }
    );
}

module.exports = {
    registerGetUsersByRoleTool,
};