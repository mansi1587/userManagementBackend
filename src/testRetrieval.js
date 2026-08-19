require("dotenv").config();

const {
  GoogleGenerativeAIEmbeddings,
} = require("@langchain/google-genai");

const {
  searchSimilarChunks,
} = require("./services/retrievalService");

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-2",
  apiKey: process.env.GEMINI_API_KEY,
});

const test = async () => {
  try {
    const question =
      "How many Casual Leave days are employees entitled to?";

    const documentId = 4;

    // Generate embedding for the question
    const queryEmbedding =
      await embeddings.embedQuery(question);

    console.log(
      "Query vector dimensions:",
      queryEmbedding.length
    );

    // Search similar chunks
    const results = await searchSimilarChunks(
      queryEmbedding,
      documentId,
      3
    );

    console.log("\nSimilar chunks:\n");

    results.forEach((result, index) => {
      console.log(`========== RESULT ${index + 1} ==========`);

      console.log("Chunk index:", result.chunk_index);
      console.log("Distance:", result.distance);

      console.log("\nContent:");
      console.log(result.chunk_text);
    });
  } catch (error) {
    console.error("Retrieval error:", error);
  }
};

test();