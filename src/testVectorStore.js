require("dotenv").config();

const {
  loadPDF,
  splitDocuments,
} = require("./services/documentService");

const {
  createEmbeddings,
} = require("./services/embeddingService");

const {
  storeChunks,
} = require("./services/vectorStoreService");

const filePath =
  "uploads/documents/232e95b7-9ed5-4a52-abee-b13a0fb21a78.pdf";

const documentId = 4;

const test = async () => {
  try {
    // 1. Load PDF
    const documents = await loadPDF(filePath);

    // 2. Split into chunks
    const chunks = await splitDocuments(documents);

    console.log("Chunks:", chunks.length);

    // 3. Generate embeddings
    const vectors = await createEmbeddings(chunks);

    console.log("Vectors:", vectors.length);

    // 4. Store chunks + vectors
    await storeChunks(documentId, chunks, vectors);

    console.log("Chunks and embeddings stored successfully");
  } catch (error) {
    console.error("Vector storage error:", error);
  }
};

test();