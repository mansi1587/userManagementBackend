const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const { getAdminDashboard } = require("../controllers/dashboardController");

router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("Admin"),
  getAdminDashboard
);

module.exports = router;