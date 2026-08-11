const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { logAudit } = require("../services/auditService");

const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      search = "",
      sortBy = "created_at",
      sortOrder = "desc",
      state = "",
      gender = "",
      role = "",
    } = req.query;

    const allowedSortColumns = [
      "first_name",
      "last_name",
      "email",
      "gender",
      "role",
      "created_at",
    ];

    const sortColumn = allowedSortColumns.includes(sortBy)
      ? sortBy
      : "created_at";

    const order = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    let whereClause = [];
    let values = [];
    let index = 1;

    // Search
    if (search) {
      whereClause.push(
        `(u.first_name ILIKE $${index}
          OR u.last_name ILIKE $${index}
          OR u.email ILIKE $${index})`,
      );

      values.push(`%${search}%`);
      index++;
    }

    // State Filter
    if (state) {
      whereClause.push(`s.name = $${index}`);
      values.push(state);
      index++;
    }

    // Gender Filter
    if (gender) {
      whereClause.push(`u.gender = $${index}`);
      values.push(gender);
      index++;
    }

    // Role Filter
    if (role) {
      whereClause.push(`u.role = $${index}`);
      values.push(role);
      index++;
    }

    const whereSQL =
      whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : "";

    /*
      Total Count
    */

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM users u
      LEFT JOIN states s
      ON u.state_id=s.id
      ${whereSQL}
      `,
      values,
    );

    const totalCount = Number(countResult.rows[0].total);

    /*
      Pagination
    */

    const offset = (page - 1) * pageSize;

    values.push(pageSize);
    values.push(offset);

    /*
      Users
    */

    const result = await pool.query(
      `
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

      LEFT JOIN countries c
      ON u.country_id=c.id

      LEFT JOIN states s
      ON u.state_id=s.id

      LEFT JOIN cities ci
      ON u.city_id=ci.id

      ${whereSQL}

      ORDER BY u.${sortColumn} ${order}

      LIMIT $${index}
      OFFSET $${index + 1}
      `,
      values,
    );

    return res.status(200).json({
      success: true,

      data: result.rows,

      pagination: {
        currentPage: Number(page),
        pageSize: Number(pageSize),
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },

      message: "Users fetched successfully",

      errors: [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
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
    const result = await pool.query(
      `
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
         u.updated_at,
    u.last_login_at,
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
      [userId],
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
    } = req.body;

    // Validate required fields
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
 let parsedInterests = [];
 if (interests) {
      try {
        parsedInterests =
          typeof interests === "string"
            ? JSON.parse(interests)
            : interests;
      } catch (error) {
        return res.status(400).json({
          success: false,
          data: null,
          message: "Invalid interests format",
          errors: [],
        });
      }
    }

    // Make sure interests is actually an array
    if (!Array.isArray(parsedInterests)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Interests must be an array",
        errors: [],
      });
    }


    // -----------------------------------------
    // Get existing profile picture
    // -----------------------------------------

    const existingUser = await pool.query(
      `
      SELECT profile_picture
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    // Keep existing picture by default
    let profilePicture =
      existingUser.rows[0].profile_picture;

    // If a new picture was uploaded,
    // replace the existing picture
    if (req.file) {
      profilePicture =
        `/uploads/profile-pictures/${req.file.filename}`;
    }

    // -----------------------------------------
    // Update user
    // -----------------------------------------

    const result = await pool.query(
      `
      UPDATE users
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
        profile_picture
      `,
      [
        first_name,
        last_name,
        gender,
        country_id,
        state_id,
        city_id,
        zip || null,
        parsedInterests,
        profilePicture,
        id,
      ]
    );

    await logAudit({
      actionType: "User Updated",
      performedBy: req.user.userId,
      targetUser: id,
      details: "Admin updated user details",
      ipAddress: req.ip,
    });

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
      [role, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    await logAudit({
      actionType: "Role Changed",
      performedBy: req.user.userId,
      targetUser: id,
      details: `Role changed to ${role}`,
      ipAddress: req.ip,
    });

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

    const parsedInterests =
  typeof interests === "string"
    ? JSON.parse(interests)
    : interests || [];

    // -----------------------------------------
    // Get existing profile picture
    // -----------------------------------------

    const existingUser = await pool.query(
      `
      SELECT profile_picture
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }

    // Keep existing picture by default
    let profilePicture =
      existingUser.rows[0].profile_picture;

    // If a new picture was uploaded,
    // replace the existing picture
    if (req.file) {
      profilePicture =
        `/uploads/profile-pictures/${req.file.filename}`;
    }

    // -----------------------------------------
    // Update profile
    // -----------------------------------------

    const result = await pool.query(
      `
      UPDATE users
      SET
        first_name = $1,
        last_name = $2,
        gender = $3,
        country_id = $4,
        state_id = $5,
        city_id = $6,
        zip = $7,
        interests = $8,
        profile_picture = $9,
        updated_at = NOW()
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
        role,
        profile_picture,
        updated_at
      `,
      [
        firstName,
        lastName,
        gender,
        country,
        state,
        city,
        zip || null,
        parsedInterests,
        profilePicture,
        userId,
      ]
    );

    // -----------------------------------------
    // Audit log
    // -----------------------------------------

    await logAudit({
      actionType: "User Updated",
      performedBy: userId,
      targetUser: userId,
      details: "User updated their own profile",
      ipAddress: req.ip,
    });

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
      [id],
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
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2`,
      [hashedPassword, id],
    );

    await logAudit({
      actionType: "Password Reset",
      performedBy: req.user.userId,
      targetUser: id,
      details: "Admin reset user password",
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: "User password reset successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Reset user password error:", error);

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
      `SELECT id, first_name, last_name, email
   FROM users
   WHERE id = $1`,
      [id],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
        errors: [],
      });
    }
    const deletedUser = userResult.rows[0];
    // Delete user
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    await logAudit({
      actionType: "User Deleted",
      performedBy: req.user.userId,
      targetUser: null,
      details: `Deleted user ${deletedUser.first_name} ${deletedUser.last_name} (${deletedUser.email})`,
      ipAddress: req.ip,
    });
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
  deleteUser,
};
