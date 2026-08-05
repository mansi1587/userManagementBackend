const pool = require("../config/db");

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
        u.profile_picture,
        u.created_at,
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

module.exports = {
  getUsers,
};