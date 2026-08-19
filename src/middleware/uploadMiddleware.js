const multer = require("multer");
const path = require("path");
const crypto = require("crypto");


if (!process.env.PROFILE_PICTURES_UPLOAD_FOLDER) {
  throw new Error(
    "PROFILE_PICTURES_UPLOAD_FOLDER is not configured in .env"
  );
}

if (!process.env.DOCUMENTS_UPLOAD_FOLDER) {
  throw new Error(
    "DOCUMENTS_UPLOAD_FOLDER is not configured in .env"
  );
}
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.PROFILE_PICTURES_UPLOAD_FOLDER);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG and PNG images are allowed")
    );
  }

  cb(null, true);
};

const uploadProfilePicture = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },

  fileFilter,
});

// ===============================
// PDF Document Upload
// ===============================
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.DOCUMENTS_UPLOAD_FOLDER);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const documentFilter = (req, file, cb) => {
  console.log("Original name:", file.originalname);
  console.log("MIME type:", file.mimetype);

  const extension = path.extname(file.originalname).toLowerCase();

  if (
    extension !== ".pdf" ||
    !["application/pdf", "application/octet-stream"].includes(file.mimetype)
  ) {
    return cb(new Error("Only PDF files are allowed"));
  }

  cb(null, true);
};

const uploadPDF = multer({
  storage: documentStorage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: documentFilter,
});

module.exports = {
  uploadProfilePicture,
  uploadPDF
};