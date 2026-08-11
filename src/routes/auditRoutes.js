const express = require("express");

const {
  getAuditLogs, getAuditUsers
} = require("../controllers/auditController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("Admin"),
  getAuditLogs
);

router.get(
  "/users",
  authMiddleware,
  authorizeRoles("Admin"),
  getAuditUsers
);

module.exports = router;