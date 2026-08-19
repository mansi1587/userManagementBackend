const pool = require("../config/db");

const storeChunks = async (documentId, chunks, vectors) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const vector = `[${vectors[i].join(",")}]`;

            await client.query(
                `
        INSERT INTO document_chunks
        (
          document_id,
          chunk_index,
          chunk_text,
          embedding,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
                [
                    documentId,
                    i,
                    chunk.pageContent,
                    vector,
                    JSON.stringify(chunk.metadata),
                ]
            );
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    storeChunks,
};