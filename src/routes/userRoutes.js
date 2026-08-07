const express = require("express");
const {
  getUsers,
  getMyProfile,
  updateUser,
  updateUserRole,
  updateMyProfile,
  resetUserPassword,
  deleteUser,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("Admin"), getUsers);
router.get(
    "/profile",
    authMiddleware,
    getMyProfile
);
router.put(
  "/profile",
  authMiddleware,
  updateMyProfile
);
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
