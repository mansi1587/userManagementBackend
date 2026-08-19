const express = require("express");

const {
  askQuestion,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Ask question from selected PDF
router.post(
  "/",
  authMiddleware,
  askQuestion
);

module.exports = router;