require("dotenv").config();

const {
  loadPDF,
  splitDocuments,
} = require("./services/documentService");

const {
  createEmbeddings,
} = require("./services/embeddingService");

const filePath =
  "uploads/documents/232e95b7-9ed5-4a52-abee-b13a0fb21a78.pdf";

const test = async () => {
  try {
    // 1. Load PDF
    const documents = await loadPDF(filePath);

    // 2. Split PDF into chunks
    const chunks = await splitDocuments(documents);

    console.log("Chunks:", chunks.length);

    // 3. Generate embeddings
    const vectors = await createEmbeddings(chunks);

    console.log("Vectors:", vectors.length);

    console.log("First vector dimensions:", vectors[0].length);

    console.log("First vector:");
    console.log(vectors[0]);

  } catch (error) {
    console.error("Embedding error:", error);
  }
};

test();