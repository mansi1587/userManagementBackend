require("dotenv").config();

const {
  GoogleGenerativeAIEmbeddings,
} = require("@langchain/google-genai");

const {
  searchSimilarChunks,
} = require("./services/retrievalService");

const {
  generateAnswer,
} = require("./services/llmService");

// Embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-2",
  apiKey: process.env.GEMINI_API_KEY,
});

const testRAG = async () => {
  try {
    // --------------------------------
    // 1. User question
    // --------------------------------

    const question =
      "How many Casual Leave days are employees entitled to?";

    // Selected PDF
    const documentId = 4;

    console.log("\nUser Question:");
    console.log(question);

    // --------------------------------
    // 2. Convert question → embedding
    // --------------------------------

    const queryEmbedding =
      await embeddings.embedQuery(question);

    console.log(
      "\nQuery vector dimensions:",
      queryEmbedding.length
    );

    // --------------------------------
    // 3. Retrieve relevant chunks
    // --------------------------------

    const results = await searchSimilarChunks(
      queryEmbedding,
      documentId,
      3
    );

    console.log("\nRetrieved chunks:", results.length);

    results.forEach((result, index) => {
      console.log(
        `\n========== RESULT ${index + 1} ==========`
      );

      console.log("Chunk index:", result.chunk_index);
      console.log("Distance:", result.distance);

      console.log("\nContent:");
      console.log(result.chunk_text);
    });

    // --------------------------------
    // 4. Create context
    // --------------------------------

    const context = results
      .map(
        (result, index) =>
          `--- Document Chunk ${index + 1} ---\n${result.chunk_text}`
      )
      .join("\n\n");

    console.log("\n========== CONTEXT ==========\n");
    console.log(context);

    // --------------------------------
    // 5. Send context + question to LLM
    // --------------------------------

    const answer = await generateAnswer(
      question,
      context
    );

    // --------------------------------
    // 6. Final answer
    // --------------------------------

    console.log("\n========== FINAL ANSWER ==========\n");
    console.log(answer);

  } catch (error) {
    console.error("\nRAG Error:", error);
  }
};

testRAG();