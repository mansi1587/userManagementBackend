const pool = require("../config/db");
const bcrypt = require("bcrypt");

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.gender,
        u.zip,
        u.interests,
        u.role,
        u.profile_picture,
        u.created_at,
        u.country_id,
    u.state_id,
    u.city_id,
        c.name AS country,
        s.name AS state,
        ci.name AS city
      FROM users u
      LEFT JOIN countries c ON u.country_id = c.id
      LEFT JOIN states s ON u.state_id = s.id
      LEFT JOIN cities ci ON u.city_id = ci.id
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Users fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch users",
      errors: [],
    });
  }
};

const getMyProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.gender,
        u.zip,
        u.interests,
        u.role,
        u.profile_picture,
        u.created_at,
        u.country_id,
    u.state_id,
    u.city_id,
        c.name AS country,
        s.name AS state,
        ci.name AS city
      FROM users u
      LEFT JOIN countries c ON u.country_id = c.id
      LEFT JOIN states s ON u.state_id = s.id
      LEFT JOIN cities ci ON u.city_id = ci.id
      WHERE u.id=$1
    `,
   [userId]
  );

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Users fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch users",
      errors: [],
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      first_name,
      last_name,
      gender,
      country_id,
      state_id,
      city_id,
      zip,
      interests,
      profile_picture,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !gender ||
      !country_id ||
      !state_id ||
      !city_id
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Required fields are missing",
        errors: [],
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET
         first_name = $1,
         last_name = $2,
         gender = $3,
         country_id = $4,
         state_id = $5,
         city_id = $6,
         zip = $7,
         interests = $8,
         profile_picture = $9
       WHERE id = $10
       RETURNING
         id,
         first_name,
         last_name,
         email,
         gender,
         country_id,
         state_id,
         city_id,
         zip,
         interests,
         profile_picture`,
      [
        first_name,
        last_name,
        gender,
        country_id,
        state_id,
        city_id,
        zip || null,
        interests || [],
        profile_picture || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "User updated successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to update user",
      errors: [],
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["Admin", "User"].includes(role)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid role",
        errors: [],
      });
    }

    const result = await pool.query(
      `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, first_name, last_name, email, role
      `,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Role updated successfully",
      errors: [],
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to update role",
      errors: [],
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      firstName,
      lastName,
      gender,
      country,
      state,
      city,
      zip,
      interests,
    } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET
         first_name = $1,
         last_name = $2,
         gender = $3,
         country_id = $4,
         state_id = $5,
         city_id = $6,
         zip = $7,
         interests = $8,
         updated_at = NOW()
       WHERE id = $9
       RETURNING
         id,
         first_name,
         last_name,
         email,
         gender,
         country_id,
         state_id,
         city_id,
         zip,
         interests,
         role,
         profile_picture,
         updated_at`,
      [
        firstName,
        lastName,
        gender,
        country,
        state,
        city,
        zip || null,
        interests || [],
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Profile updated successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to update profile",
      errors: ["Internal server error"],
    });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "New password is required",
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

    // Check whether user exists
    const userResult = await pool.query(
      `SELECT id
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    await pool.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2`,
      [hashedPassword, id]
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: "User password reset successfully",
      errors: [],
    });
  } catch (error) {
    console.error(
      "Reset user password error:",
      error
    );

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to reset user password",
      errors: [],
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    // Delete user
    await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: null,
      message: "User deleted successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to delete user",
      errors: [],
    });
  }
};

module.exports = {
  getUsers,
  getMyProfile,
  updateUser,
  updateUserRole,
  updateMyProfile,
  resetUserPassword,
  deleteUser
};
