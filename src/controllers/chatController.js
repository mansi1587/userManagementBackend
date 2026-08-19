const pool = require("../config/db");

const {
  createQueryEmbedding,
} = require("../services/embeddingService");

const {
  generateAnswer,
} = require("../services/llmService");

const askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    // -----------------------------------------
    // Validate input
    // -----------------------------------------

    if (!documentId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "documentId is required",
        errors: [],
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Question is required",
        errors: [],
      });
    }

    const trimmedQuestion = question.trim();

    // -----------------------------------------
    // Step 1: Check selected document
    // -----------------------------------------

    const documentResult = await pool.query(
      `
      SELECT id, file_name
      FROM documents
      WHERE id = $1
      `,
      [documentId]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Document not found",
        errors: [],
      });
    }

    const document = documentResult.rows[0];

    // -----------------------------------------
    // Step 2: Create embedding for question
    // -----------------------------------------

    const queryVector = await createQueryEmbedding(
      trimmedQuestion
    );

    console.log(
      "Query vector dimensions:",
      queryVector.length
    );

    // Defensive check
    if (!queryVector || queryVector.length === 0) {
      const error = new Error(
        "Query embedding is empty."
      );

      error.code = "EMPTY_QUERY_EMBEDDING";

      throw error;
    }

    const vectorString = `[${queryVector.join(",")}]`;

    // -----------------------------------------
    // Step 3: Search selected document only
    // -----------------------------------------

    const result = await pool.query(
      `
      SELECT
        id,
        chunk_index,
        chunk_text,
        metadata,
        embedding <=> $1::vector AS distance
      FROM document_chunks
      WHERE document_id = $2
      ORDER BY embedding <=> $1::vector
      LIMIT 3
      `,
      [vectorString, documentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "No content found in the selected document",
        errors: [],
      });
    }

    console.log(
      `Retrieved chunks: ${result.rows.length}`
    );

    // -----------------------------------------
    // Step 4: Build context
    // -----------------------------------------

    const context = result.rows
      .map((row, index) => {
        return `--- Document Chunk ${index + 1} ---\n${row.chunk_text}`;
      })
      .join("\n\n");

    console.log(
      "\n========== CONTEXT ==========\n"
    );

    console.log(context);

    // -----------------------------------------
    // Step 5: Generate answer using LLM
    // -----------------------------------------

    const answer = await generateAnswer(
      trimmedQuestion,
      context
    );

    // -----------------------------------------
    // Step 6: Return response
    // -----------------------------------------

    return res.status(200).json({
      success: true,
      data: {
        documentId: document.id,
        documentName: document.file_name,
        question: trimmedQuestion,
        answer,
      },
      message: "Answer generated successfully",
      errors: [],
    });

  } catch (error) {
    console.error("Ask question error:", error);

    // -----------------------------------------
    // Query embedding / Gemini embedding error
    // -----------------------------------------

    if (
      error.code ===
        "QUERY_EMBEDDING_GENERATION_FAILED" ||
      error.code === "EMPTY_QUERY_EMBEDDING"
    ) {
      return res.status(503).json({
        success: false,
        data: null,
        message:
          "AI embedding service is currently unavailable.",
        errors: [
          {
            code: error.code,
            message:
              "Unable to process the question because the AI embedding service is unavailable.",
          },
        ],
      });
    }

    // -----------------------------------------
    // LLM / Gemini answer generation error
    // -----------------------------------------

    if (
      error.code === "LLM_GENERATION_FAILED" ||
      error.code === "AI_SERVICE_UNAVAILABLE"
    ) {
      return res.status(503).json({
        success: false,
        data: null,
        message:
          "AI answer generation service is currently unavailable.",
        errors: [
          {
            code: error.code,
            message:
              "Unable to generate an answer because the AI service is unavailable.",
          },
        ],
      });
    }

    // -----------------------------------------
    // Database / unexpected error
    // -----------------------------------------

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to generate answer",
      errors: [],
    });
  }
};

module.exports = {
  askQuestion,
};