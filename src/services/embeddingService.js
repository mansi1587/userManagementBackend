const {
    GoogleGenerativeAIEmbeddings,
} = require("@langchain/google-genai");

const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-2",
    apiKey: process.env.GEMINI_API_KEY,
});

const createEmbeddings = async (chunks) => {
    try {
        const texts = chunks.map((chunk) => chunk.pageContent);

        const vectors = await embeddings.embedDocuments(texts);

        return vectors;
    } catch (error) {
        console.error("Embedding generation error:", error);

        const embeddingError = new Error(
            "Failed to generate document embeddings."
        );

        embeddingError.code = "EMBEDDING_GENERATION_FAILED";
        embeddingError.originalError = error;

        throw embeddingError;
    }

};

const createQueryEmbedding = async (question) => {
  try {
    const vector = await embeddings.embedQuery(question);

    return vector;
  } catch (error) {
    console.error("Query embedding generation error:", error);

    const embeddingError = new Error(
      "Failed to generate query embedding."
    );

    embeddingError.code = "QUERY_EMBEDDING_GENERATION_FAILED";
    embeddingError.originalError = error;

    throw embeddingError;
  }
};

module.exports = {
    createEmbeddings,
    createQueryEmbedding,
};