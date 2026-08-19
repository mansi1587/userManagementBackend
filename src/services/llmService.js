const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

const generateAnswer = async (question, context) => {
  const prompt = `
You are an assistant that answers questions based only on the provided document context.

Rules:
- Answer only using the information provided in the context.
- If the answer is not present in the context, say:
  "I could not find the answer in the selected document."
- Do not make up information.
- Keep the answer clear and concise.

Document Context:
${context}

User Question:
${question}

Answer:
`;

 try {
    const response = await llm.invoke(prompt);

    return response.content;
  } catch (error) {
    console.error("Gemini API error:", error);

    const aiError = new Error(
      "AI service is currently unavailable. Please try again later."
    );

    aiError.code = "AI_SERVICE_UNAVAILABLE";
    aiError.originalError = error;

    throw aiError;
  }
};

module.exports = {
  generateAnswer,
};