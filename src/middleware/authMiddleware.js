const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
     console.log(req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        data: null,
        message: "Authentication token is required",
        errors: [],
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     console.log(decoded);
    req.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      data: null,
      message: "Invalid or expired authentication token",
      errors: [],
    });
  }
};

module.exports = authMiddleware;