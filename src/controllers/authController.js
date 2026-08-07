const crypto = require("crypto");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      email,
      password,
      country,
      state,
      city,
      zip,
      interests,
    } = req.body;

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !gender ||
      !email ||
      !password ||
      !country ||
      !state ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Please provide all required fields",
        errors: [],
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Email already registered",
        errors: [],
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (
        first_name,
        last_name,
        gender,
        email,
        password,
        role,
        country_id,
        state_id,
        city_id,
        zip,
        interests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        id,
        first_name,
        last_name,
        gender,
        email,
        role,
        country_id,
        state_id,
        city_id,
        zip,
        interests,
        created_at`,
      [
        firstName,
        lastName,
        gender,
        email,
        hashedPassword,
        'User',
        country,
        state,
        city,
        zip || null,
        interests || [],
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "User registered successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Error registering user:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to register user",
      errors: ["Internal server error"],
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Email and password are required",
        errors: [],
      });
    }

    // Find user by email
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, password, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password",
        errors: [],
      });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Invalid email or password",
        errors: [],
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          role: user.role,
        },
      },
      message: "Login successful",
      errors: [],
    });
  } catch (error) {
    console.error("Error logging in:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to login",
      errors: ["Internal server error"],
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Email is required",
        errors: [],
      });
    }

    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "No account found with this email",
        errors: [],
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in database
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET reset_password_token_hash = $1,
           reset_password_token_expires_at = $2
       WHERE id = $3`,
      [tokenHash, expiresAt, result.rows[0].id]
    );

    // Simulate email delivery
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    return res.status(200).json({
      success: true,
      data: {
        resetLink,
      },
      message: "Password reset link generated successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to generate password reset link",
      errors: [],
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Token and new password are required",
        errors: [],
      });
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        data: null,
        message:
          "Password must be at least 8 characters and contain uppercase, lowercase, number and special character",
        errors: [],
      });
    }

    // Hash incoming token
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE reset_password_token_hash = $1
       AND reset_password_token_expires_at > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid or expired password reset link",
        errors: [],
      });
    }

    const userId = result.rows[0].id;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password AND invalidate token
    await pool.query(
      `UPDATE users
       SET password = $1,
           reset_password_token_hash = NULL,
           reset_password_token_expires_at = NULL
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: "Password reset successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to reset password",
      errors: [],
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};