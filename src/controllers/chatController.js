const pool = require("../config/db");

const {
  createQueryEmbedding,
} = require("../services/embeddingService");

const {
  searchSimilarChunks,
} = require("../services/retrievalService");

const {
  generateAnswer,
} = require("../services/llmService");

const {
  contextualizeQuestion,
} = require("../services/questionContextService");


const askQuestion = async (req, res) => {
  try {
    const {
      documentId,
      question,
      history = [],
    } = req.body;

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

    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "history must be an array",
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
    // Step 2: Contextualize question
    // -----------------------------------------

    const standaloneQuestion =
      await contextualizeQuestion(
        trimmedQuestion,
        history
      );

    console.log(
      "\n========== QUESTION =========="
    );

    console.log(
      "Original Question:",
      trimmedQuestion
    );

    console.log(
      "Standalone Question:",
      standaloneQuestion
    );


    // -----------------------------------------
    // Step 3: Create embedding for
    // standalone question
    // -----------------------------------------

    const queryVector =
      await createQueryEmbedding(
        standaloneQuestion
      );

    // Defensive check
    if (
      !queryVector ||
      queryVector.length === 0
    ) {
      const error = new Error(
        "Query embedding is empty."
      );

      error.code =
        "EMPTY_QUERY_EMBEDDING";

      throw error;
    }

    console.log(
      "Query vector dimensions:",
      queryVector.length
    );


    // -----------------------------------------
    // Step 4: Retrieve similar chunks
    // from selected document
    // -----------------------------------------

    const result =
      await searchSimilarChunks(
        queryVector,
        documentId,
        3
      );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message:
          "No content found in the selected document",
        errors: [],
      });
    }

    console.log(
      `Retrieved chunks: ${result.length}`
    );


    // -----------------------------------------
    // Step 5: Build context
    // -----------------------------------------

    const context = result
      .map((row, index) => {
        return `--- Document Chunk ${index + 1} ---\n${row.chunk_text}`;
      })
      .join("\n\n");

    console.log(
      "\n========== CONTEXT ==========\n"
    );

    console.log(context);


    // -----------------------------------------
    // Step 6: Generate answer
    // -----------------------------------------

    const answer =
      await generateAnswer(
        standaloneQuestion,
        context
      );


    // -----------------------------------------
    // Step 7: Return response
    // -----------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        documentId: document.id,
        documentName: document.file_name,

        // Original question asked by user
        question: trimmedQuestion,

        // Useful for debugging now.
        // We can remove this from production later.
        standaloneQuestion,

        answer,
      },

      message: "Answer generated successfully",

      errors: [],
    });

  } catch (error) {

    console.error(
      "Ask question error:",
      error
    );


    // -----------------------------------------
    // Question contextualization error
    // -----------------------------------------

    if (
      error.code ===
      "QUESTION_CONTEXTUALIZATION_FAILED"
    ) {
      return res.status(503).json({
        success: false,

        data: null,

        message:
          "AI question contextualization service is currently unavailable.",

        errors: [
          {
            code:
              "QUESTION_CONTEXTUALIZATION_FAILED",

            message:
              "Unable to understand the question using the conversation history.",
          },
        ],
      });
    }


    // -----------------------------------------
    // Query embedding / Gemini embedding error
    // -----------------------------------------

    if (
      error.code ===
        "QUERY_EMBEDDING_GENERATION_FAILED" ||
      error.code ===
        "EMPTY_QUERY_EMBEDDING"
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
      error.code ===
        "LLM_GENERATION_FAILED" ||
      error.code ===
        "AI_SERVICE_UNAVAILABLE"
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

      message:
        "Failed to generate answer",

      errors: [],
    });
  }
};


module.exports = {
  askQuestion,
};





// const pool = require("../config/db");

// const {
//   createQueryEmbedding,
// } = require("../services/embeddingService");

// const { searchSimilarChunks } = require("../services/retrievalService");
// const {
//   generateAnswer,
// } = require("../services/llmService");

// const {
//   contextualizeQuestion,
// } = require("../services/questionContextService");

// const askQuestion = async (req, res) => {
//   try {
//     const { documentId, question } = req.body;

//     // -----------------------------------------
//     // Validate input
//     // -----------------------------------------

//     if (!documentId) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         message: "documentId is required",
//         errors: [],
//       });
//     }

//     if (!question || !question.trim()) {
//       return res.status(400).json({
//         success: false,
//         data: null,
//         message: "Question is required",
//         errors: [],
//       });
//     }

//     const trimmedQuestion = question.trim();

//     // -----------------------------------------
//     // Step 1: Check selected document
//     // -----------------------------------------

//     const documentResult = await pool.query(
//       `
//       SELECT id, file_name
//       FROM documents
//       WHERE id = $1
//       `,
//       [documentId]
//     );

//     if (documentResult.rows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         data: null,
//         message: "Document not found",
//         errors: [],
//       });
//     }

//     const document = documentResult.rows[0];

//     // -----------------------------------------
//     // Step 2: Create embedding for question
//     // -----------------------------------------

//     const queryVector = await createQueryEmbedding(
//       trimmedQuestion
//     );
//     if (!queryVector || queryVector.length === 0) {
//       const error = new Error("Query embedding is empty.");
//       error.code = "EMPTY_QUERY_EMBEDDING";
//       throw error;
//     }
//     console.log(
//       "Query vector dimensions:",
//       queryVector.length
//     );

//     // Defensive check
//     if (!queryVector || queryVector.length === 0) {
//       const error = new Error(
//         "Query embedding is empty."
//       );

//       error.code = "EMPTY_QUERY_EMBEDDING";

//       throw error;
//     }

//     // const vectorString = `[${queryVector.join(",")}]`;

//     // -----------------------------------------
//     // Step 3: Search selected document only
//     // -----------------------------------------

//     // const result = await pool.query(
//     //   `
//     //   SELECT
//     //     id,
//     //     chunk_index,
//     //     chunk_text,
//     //     metadata,
//     //     embedding <=> $1::vector AS distance
//     //   FROM document_chunks
//     //   WHERE document_id = $2
//     //   ORDER BY embedding <=> $1::vector
//     //   LIMIT 3
//     //   `,
//     //   [vectorString, documentId]
//     // );

//     const result = await searchSimilarChunks(
//       queryVector,
//       documentId,
//       3
//     );


//     if (result.length === 0) {
//       return res.status(404).json({
//         success: false,
//         data: null,
//         message: "No content found in the selected document",
//         errors: [],
//       });
//     }

//     console.log(
//       `Retrieved chunks: ${result.length}`
//     );

//     // -----------------------------------------
//     // Step 4: Build context
//     // -----------------------------------------

//     const context = result
//       .map((row, index) => {
//         return `--- Document Chunk ${index + 1} ---\n${row.chunk_text}`;
//       })
//       .join("\n\n");

//     console.log(
//       "\n========== CONTEXT ==========\n"
//     );

//     console.log(context);

//     // -----------------------------------------
//     // Step 5: Generate answer using LLM
//     // -----------------------------------------

//     const answer = await generateAnswer(
//       trimmedQuestion,
//       context
//     );

//     // -----------------------------------------
//     // Step 6: Return response
//     // -----------------------------------------

//     return res.status(200).json({
//       success: true,
//       data: {
//         documentId: document.id,
//         documentName: document.file_name,
//         question: trimmedQuestion,
//         answer,
//       },
//       message: "Answer generated successfully",
//       errors: [],
//     });

//   } catch (error) {
//     console.error("Ask question error:", error);

//     // -----------------------------------------
//     // Query embedding / Gemini embedding error
//     // -----------------------------------------

//     if (
//       error.code ===
//       "QUERY_EMBEDDING_GENERATION_FAILED" ||
//       error.code === "EMPTY_QUERY_EMBEDDING"
//     ) {
//       return res.status(503).json({
//         success: false,
//         data: null,
//         message:
//           "AI embedding service is currently unavailable.",
//         errors: [
//           {
//             code: error.code,
//             message:
//               "Unable to process the question because the AI embedding service is unavailable.",
//           },
//         ],
//       });
//     }

//     // -----------------------------------------
//     // LLM / Gemini answer generation error
//     // -----------------------------------------

//     if (
//       error.code === "LLM_GENERATION_FAILED" ||
//       error.code === "AI_SERVICE_UNAVAILABLE"
//     ) {
//       return res.status(503).json({
//         success: false,
//         data: null,
//         message:
//           "AI answer generation service is currently unavailable.",
//         errors: [
//           {
//             code: error.code,
//             message:
//               "Unable to generate an answer because the AI service is unavailable.",
//           },
//         ],
//       });
//     }

//     // -----------------------------------------
//     // Database / unexpected error
//     // -----------------------------------------

//     return res.status(500).json({
//       success: false,
//       data: null,
//       message: "Failed to generate answer",
//       errors: [],
//     });
//   }
// };

// module.exports = {
//   askQuestion,
// };