const express = require("express");

const {
  uploadDocument,getDocuments
} = require("../controllers/documentController");

const authMiddleware = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/authorizeRoles");

const {
  uploadPDF,
} = require("../middleware/uploadMiddleware");


const router = express.Router();


router.post(
  "/upload",
  authMiddleware,
  authorizeRoles("Admin"),
  uploadPDF.single("pdf"),
  uploadDocument
);
router.get(
  "/",
  authMiddleware,
  getDocuments
);

module.exports = router;