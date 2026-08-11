require("dotenv").config();

const express = require("express");
const cors = require("cors");
const locationRoutes = require('./routes/locationRoutes')
const authRoutes =require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const auditRoutes = require('./routes/auditRoutes')
const pool = require("./config/db");
const path = require('path')
const app = express();

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);
app.use(cors());
app.use(express.json());
app.use('/api/locations', locationRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/users', userRoutes)
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/audit-log', auditRoutes)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "User Management API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "Database connected successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});