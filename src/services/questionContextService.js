const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const contextualizationLLM = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

const contextualizeQuestion = async (
  currentQuestion,
  history = []
) => {
  try {
    // -----------------------------------------
    // Keep only last 3 conversation turns
    // 1 turn = user question + assistant answer
    // -----------------------------------------

    const recentHistory = history.slice(-6);

    // If there is no history, question is already standalone
    if (recentHistory.length === 0) {
      return currentQuestion;
    }

    const formattedHistory = recentHistory
      .map((message) => {
        const role =
          message.role === "user"
            ? "User"
            : "Assistant";

        return `${role}: ${message.content}`;
      })
      .join("\n");

    const prompt = `
You are a question contextualization assistant for a document-based RAG system.

Your job is to rewrite the user's current question into a standalone question
using the recent conversation history.

Rules:
- Use the conversation history only when necessary.
- Resolve references such as:
  "this", "that", "it", "they", "these", "the above", "are you sure", etc.
- Do not answer the question.
- Do not add information that is not present in the conversation.
- If the current question is already standalone, return it unchanged.
- Return ONLY the rewritten standalone question.
- Do not add explanations, quotes, or labels.

Recent Conversation:
${formattedHistory}

Current Question:
${currentQuestion}

Standalone Question:
`;

    const response = await contextualizationLLM.invoke(prompt);

    const standaloneQuestion = response.content?.trim();

    if (!standaloneQuestion) {
      const error = new Error(
        "Question contextualization returned an empty response."
      );

      error.code = "QUESTION_CONTEXTUALIZATION_FAILED";

      throw error;
    }

    return standaloneQuestion;

  } catch (error) {
    console.error(
      "Question contextualization error:",
      error
    );

    // Don't overwrite our own error code
    if (
      error.code ===
      "QUESTION_CONTEXTUALIZATION_FAILED"
    ) {
      throw error;
    }

    const contextualizationError = new Error(
      "Failed to contextualize question."
    );

    contextualizationError.code =
      "QUESTION_CONTEXTUALIZATION_FAILED";

    contextualizationError.originalError = error;

    throw contextualizationError;
  }
};

module.exports = {
  contextualizeQuestion,
};