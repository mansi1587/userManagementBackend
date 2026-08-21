const {
  ChatGoogleGenerativeAI,
} = require("@langchain/google-genai");

const {
  getUsersByStateTool
} = require("./tools/getUsersByStateTool");

const {
  getUsersByRoleTool
} = require("./tools/getUsersByRoleTool");

const {
  getUsersByInterestTool
} = require("./tools/getUsersByInterestTool");


// ==========================================
// 1. Gemini LLM
// ==========================================

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});


// ==========================================
// 2. MCP Tool → LangChain Tool
// ==========================================

// const getUsersByStateTool =
//   new DynamicStructuredTool({
//     name: "get_users_by_state",

//     description:
//       "Get the number of users belonging to a specific state. Use this tool when the user asks how many users belong to a particular state.",

//     schema: z.object({
//       stateName: z
//         .string()
//         .describe("Name of the state"),
//     }),

//     func: async ({ stateName }) => {

//       const result = await callMCPTool(
//         "get_users_by_state",
//         {
//           stateName,
//         }
//       );

//       const text =
//         result.content?.find(
//           (item) => item.type === "text"
//         )?.text;

//       return text || "No result found.";
//     },
//   });

//   const getUsersByRoleTool =
//   new DynamicStructuredTool({
//     name: "get_users_by_role",

//     description:
//       "Get the number of users having a specific role such as Admin or User.",

//     schema: z.object({
//       role: z
//         .string()
//         .describe(
//           "User role such as Admin or User"
//         ),
//     }),

//     func: async ({ role }) => {

//       const result =
//         await callMCPTool(
//           "get_users_by_role",
//           {
//             role,
//           }
//         );

//       const text =
//         result.content?.find(
//           (item) =>
//             item.type === "text"
//         )?.text;

//       return text || "No result found.";
//     },
//   });


// ==========================================
// 3. Bind tool to Gemini
// ==========================================

const agentModel = llm.bindTools([
  getUsersByStateTool,
getUsersByRoleTool,
  getUsersByInterestTool
]);


// ==========================================
// 4. Agent Decision Loop
// ==========================================

const runUserAgent = async (question) => {
  const messages = [
    {
      role: "system",
      content: `
You are a user management assistant.

You can answer general questions directly.

When the user asks for information about users
stored in the database, use the available tools.

Do not invent database information.

If a tool is required, call the appropriate tool.
      `,
    },

    {
      role: "user",
      content: question,
    },
  ];

  // ------------------------------------------
  // Ask Gemini whether a tool is needed
  // ------------------------------------------

  const response =
    await agentModel.invoke(messages);

  // ------------------------------------------
  // Check whether Gemini selected a tool
  // ------------------------------------------

  if (
    response.tool_calls &&
    response.tool_calls.length > 0
  ) {
    const toolCall =
      response.tool_calls[0];

    console.log(
      "Agent selected tool:",
      toolCall.name
    );

    console.log(
      "Tool arguments:",
      toolCall.args
    );

    // ----------------------------------------
    // Execute selected tool
    // ----------------------------------------

    let toolResult;

    if (
      toolCall.name === "get_users_by_state"
    ) {
      toolResult =
        await getUsersByStateTool.invoke(
          toolCall.args
        );
    } else if (
      toolCall.name === "get_users_by_role"
    ) {
      toolResult =
        await getUsersByRoleTool.invoke(
          toolCall.args
        );
    } else if (
      toolCall.name === "get_users_by_interest"
    ) {
      toolResult =
        await getUsersByInterestTool.invoke(
          toolCall.args
        );
    }
    else {
      throw new Error(
        `Unknown tool selected: ${toolCall.name}`
      );
    }

    // ----------------------------------------
    // Send tool result back to Gemini
    // ----------------------------------------

    const finalResponse =
      await llm.invoke([
        ...messages,

        response,

        {
          role: "tool",
          content: toolResult,
          tool_call_id: toolCall.id,
        },
      ]);

    return finalResponse.content;
  }

  // ------------------------------------------
  // No tool required
  // ------------------------------------------

  return response.content;
};

module.exports = {
  runUserAgent,
};