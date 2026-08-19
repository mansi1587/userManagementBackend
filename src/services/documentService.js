const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const {
  RecursiveCharacterTextSplitter,
} = require("@langchain/textsplitters");

const loadPDF = async (filePath) => {
  const loader = new PDFLoader(filePath);

  const documents = await loader.load();

  return documents;
};

const splitDocuments = async (documents) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitDocuments(documents);

  return chunks;
};
module.exports = {
  loadPDF,
  splitDocuments,
};