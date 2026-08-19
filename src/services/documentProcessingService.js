const {
  loadPDF,
  splitDocuments,
} = require("./documentService");

const {
  createEmbeddings,
} = require("./embeddingService");

const {
  storeChunks,
} = require("./vectorStoreService");

const processDocument = async (filePath, documentId) => {

    try{
// Step 1: Load PDF
  const documents = await loadPDF(filePath);

  console.log(`Documents loaded: ${documents.length}`);

  // Step 2: Split PDF into chunks
  const chunks = await splitDocuments(documents);

  console.log(`Chunks created: ${chunks.length}`);

  // Step 3: Create embedding for each chunk
  const vectors = await createEmbeddings(chunks);

  console.log(`Embeddings created: ${vectors.length}`);

  // Step 4: Store chunks + embeddings
  await storeChunks(documentId, chunks, vectors);

  console.log("Chunks and embeddings stored successfully");

  return {
    documentId,
    documents: documents.length,
    chunks: chunks.length,
    embeddings: vectors.length,
  };
    }catch (error) {
    console.error("Document processing error:", error);

    const processingError = new Error(
      "Failed to process document."
    );

    processingError.code = "DOCUMENT_PROCESSING_FAILED";
    processingError.originalError = error;

    throw processingError;
  }
  
};

module.exports = {
  processDocument,
};