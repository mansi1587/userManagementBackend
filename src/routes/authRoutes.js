    const express = require("express");

    const { registerUser,loginUser, forgotPassword, resetPassword } = require("../controllers/authController");

    const router = express.Router();
    const {
    uploadProfilePicture,
    } = require("../middleware/uploadMiddleware");

    router.post("/register",uploadProfilePicture.single("profile_picture"), registerUser);
    router.post('/login', loginUser)
    router.post("/forgot-password", forgotPassword);
    router.post("/reset-password", resetPassword);


    module.exports = router;