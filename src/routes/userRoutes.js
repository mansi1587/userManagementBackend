const express = require("express");
const { getUsers , updateUser, resetUserPassword, deleteUser} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.put('/:id', authMiddleware, updateUser )
router.post(
  "/:id/reset-password",
  authMiddleware,
  resetUserPassword
);
router.delete(
  "/:id",
  authMiddleware,
  deleteUser
);

module.exports = router;