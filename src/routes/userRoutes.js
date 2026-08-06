const express = require("express");
const {
  getUsers,
  updateUser,
  updateUserRole,
  resetUserPassword,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Admin"), getUsers);
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateUser);
router.put(
    "/:id/role",
    authMiddleware,
    authorizeRoles("Admin"),
    updateUserRole
);
router.post(
  "/:id/reset-password",
  authMiddleware,
  authorizeRoles("Admin"),
  resetUserPassword,
);
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);

module.exports = router;
