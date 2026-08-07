const pool = require("../config/db");

const getAdminDashboard = async (req, res) => {
  try {
    // 1. Total users
    const totalUsersResult = await pool.query(
      "SELECT COUNT(*) AS count FROM users"
    );

    // 2. New users in last 7 days
    const newUsersResult = await pool.query(
      `SELECT COUNT(*) AS count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '7 days'`
    );

    // 3. Users by role
    const roleResult = await pool.query(
      `SELECT role, COUNT(*) AS count
       FROM users
       GROUP BY role`
    );

    // Convert rows into object
    const usersByRole = {};
    roleResult.rows.forEach((row) => {
      usersByRole[row.role] = Number(row.count);
    });

     // 4. Users By Interest
    const interestResult = await pool.query(`
      SELECT
          interest,
          COUNT(*) AS count
      FROM (
          SELECT UNNEST(interests) AS interest
          FROM users
      ) t
      GROUP BY interest
      ORDER BY count DESC
    `);

    // 5. Top 5 States
    const stateResult = await pool.query(`
      SELECT
          s.name AS state,
          COUNT(u.id) AS count
      FROM users u
      JOIN states s
          ON u.state_id = s.id
      GROUP BY s.name
      ORDER BY count DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: Number(totalUsersResult.rows[0].count),
        newUsersLast7Days: Number(newUsersResult.rows[0].count),
        usersByRole,
         usersByInterest: interestResult.rows.map((row) => ({
          interest: row.interest,
          count: Number(row.count),
        })),

        usersByState: stateResult.rows.map((row) => ({
          state: row.state,
          count: Number(row.count),
        })),
      },
      message: "Dashboard data fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch dashboard data",
      errors: [],
    });
  }
};

module.exports = {
  getAdminDashboard,
};