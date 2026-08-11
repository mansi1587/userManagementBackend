const pool = require("../config/db");

const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      actionType = "",
      fromDate = "",
      toDate = "",
      performedBy = "",
      targetUser = "",
    } = req.query;

    /*
     * -----------------------------------------
     * Pagination
     * -----------------------------------------
     */

    const parsedPage = Number(page);
    const parsedPageSize = Number(pageSize);

    const currentPage = Number.isFinite(parsedPage)
      ? Math.max(parsedPage, 1)
      : 1;

    const limit = Number.isFinite(parsedPageSize)
      ? Math.min(Math.max(parsedPageSize, 1), 100)
      : 10;

    const offset = (currentPage - 1) * limit;

    /*
     * -----------------------------------------
     * Build WHERE conditions
     * -----------------------------------------
     */

    const conditions = [];
    const values = [];
    let parameterIndex = 1;

    // Action Type
    if (actionType) {
      conditions.push(
        `a.action_type = $${parameterIndex}`
      );

      values.push(actionType);
      parameterIndex++;
    }

    // From Date
    if (fromDate) {
      conditions.push(
        `a.created_at >= $${parameterIndex}`
      );

      values.push(fromDate);
      parameterIndex++;
    }

    // To Date
    if (toDate) {
      conditions.push(
        `a.created_at < ($${parameterIndex}::date + INTERVAL '1 day')`
      );

      values.push(toDate);
      parameterIndex++;
    }

    // Performed By
    if (performedBy) {
      conditions.push(
        `a.performed_by = $${parameterIndex}`
      );

      values.push(performedBy);
      parameterIndex++;
    }

    // Target User
    if (targetUser) {
      conditions.push(
        `a.target_user = $${parameterIndex}`
      );

      values.push(targetUser);
      parameterIndex++;
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    /*
     * -----------------------------------------
     * Get total count
     * -----------------------------------------
     */

    const countResult = await pool.query(
      `
      SELECT COUNT(*) AS total
      FROM audit_logs a
      ${whereClause}
      `,
      values
    );

    const totalCount = Number(
      countResult.rows[0].total
    );

    /*
     * -----------------------------------------
     * Get audit logs
     * -----------------------------------------
     */

    const dataValues = [
      ...values,
      limit,
      offset,
    ];

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.action_type,

        a.performed_by,
        a.target_user,

        a.details,
        a.ip_address,
        a.created_at,

        CONCAT(
          performer.first_name,
          ' ',
          performer.last_name
        ) AS performed_by_name,

        CONCAT(
          target.first_name,
          ' ',
          target.last_name
        ) AS target_user_name

      FROM audit_logs a

      LEFT JOIN users performer
        ON a.performed_by = performer.id

      LEFT JOIN users target
        ON a.target_user = target.id

      ${whereClause}

      ORDER BY a.created_at DESC

      LIMIT $${parameterIndex}
      OFFSET $${parameterIndex + 1}
      `,
      dataValues
    );

    /*
     * -----------------------------------------
     * Response
     * -----------------------------------------
     */

    return res.status(200).json({
      success: true,

      data: result.rows,

      pagination: {
        currentPage,
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(
          totalCount / limit
        ),
      },

      message: "Audit logs fetched successfully",

      errors: [],
    });
  } catch (error) {
    console.error(
      "Get audit logs error:",
      error
    );

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch audit logs",
      errors: [],
    });
  }
};

const getAuditUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        email
      FROM users
      ORDER BY first_name, last_name
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: "Audit users fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Get audit users error:", error);

    return res.status(500).json({
      success: false,
      data: null,
      message: "Failed to fetch audit users",
      errors: [],
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditUsers
};