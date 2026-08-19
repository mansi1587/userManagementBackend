
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
    // Step 1: Load PDF
    const documents = await loadPDF(filePath);

    console.log("Documents:", documents.length);

    // Step 2: Split documents
    const chunks = await splitDocuments(documents);

    console.log("Chunks:", chunks.length);

    // Step 3: Inspect chunks
    chunks.forEach((chunk, index) => {
      console.log(`\n========== CHUNK ${index + 1} ==========`);

      console.log("Content:");
      console.log(chunk.pageContent);

      console.log("\nMetadata:");
      console.log(chunk.metadata);
    });
     // Step 3: Create embeddings
    const vectors = await createEmbeddings(chunks);

    console.log("Vectors:", vectors.length);

    // Step 4: Inspect first vector
    console.log("\nFirst vector:");
    console.log(vectors[0]);

    // Step 5: Check vector dimensions
    console.log("\nVector dimensions:");
    console.log(vectors[0].length);

  } catch (error) {
    console.error("PDF processing error:", error);
  }
};

test();