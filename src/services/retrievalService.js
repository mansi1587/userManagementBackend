const pool = require("../config/db");

const searchSimilarChunks = async (
  queryEmbedding,
  documentId,
  limit = 3
) => {
  try {
    const vector = `[${queryEmbedding.join(",")}]`;

    const result = await pool.query(
      `
      SELECT
        id,
        document_id,
        chunk_index,
        chunk_text,
        metadata,
        embedding <=> $1::vector AS distance
      FROM document_chunks
      WHERE document_id = $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
      `,
      [vector, documentId, limit]
    );

    return result.rows;

  } catch (error) {
    console.error(
      "Similar chunk retrieval error:",
      error
    );

    const retrievalError = new Error(
      "Failed to retrieve similar document chunks."
    );

    retrievalError.code =
      "VECTOR_RETRIEVAL_FAILED";

    retrievalError.originalError = error;

    throw retrievalError;
  }
};

module.exports = {
  searchSimilarChunks,
};






// const pool = require("../config/db");

// const searchSimilarChunks = async (
//   queryEmbedding,
//   documentId,
//   limit = 3
// ) => {
//   const vector = `[${queryEmbedding.join(",")}]`;

//   const result = await pool.query(
//     `
//     SELECT
//       id,
//       document_id,
//       chunk_index,
//       chunk_text,
//       metadata,
//       embedding <=> $1::vector AS distance
//     FROM document_chunks
//     WHERE document_id = $2
//     ORDER BY embedding <=> $1::vector
//     LIMIT $3
//     `,
//     [vector, documentId, limit]
//   );

//   return result.rows;
// };

// module.exports = {
//   searchSimilarChunks,
// };