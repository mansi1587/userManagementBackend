const pool = require("../config/db");

const logAudit = async ({
  actionType,
  performedBy,
  targetUser = null,
  details = "",
  ipAddress = null,
}) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs
      (
        action_type,
        performed_by,
        target_user,
        details,
        ip_address
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        actionType,
        performedBy,
        targetUser,
        details,
        ipAddress,
      ]
    );
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
};

module.exports = {
  logAudit,
};