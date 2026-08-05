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
        country_id,
        state_id,
        city_id,
        zip,
        interests
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        first_name,
        last_name,
        gender,
        email,
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
      `SELECT id, first_name, last_name, email, password
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
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
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

module.exports = {
  registerUser,
  loginUser
};