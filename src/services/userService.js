const pool = require("../config/db");

const getUsersByState = async (stateName) => {
  const result = await pool.query(
    `
    SELECT
      s.name AS state,
      COUNT(u.id)::int AS user_count
    FROM states s
    LEFT JOIN users u
      ON u.state_id = s.id
    WHERE LOWER(s.name) = LOWER($1)
    GROUP BY s.id, s.name
    `,
    [stateName]
  );

  return result.rows;
};

const getUsersByRole = async (role) => {
  const result = await pool.query(
    `
    SELECT
      role,
      COUNT(*)::int AS user_count
    FROM users
    WHERE LOWER(role) = LOWER($1)
    GROUP BY role
    `,
    [role]
  );

  return result.rows;
};

const getUsersByInterest = async (interest) => {
  const result = await pool.query(
    `
    SELECT COUNT(*) AS count
    FROM users
    WHERE $1 = ANY(interests)
    `,
    [interest]
  );

  return Number(result.rows[0].count);
};

module.exports = {
  getUsersByState,
  getUsersByRole,
  getUsersByInterest
};