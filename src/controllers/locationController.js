const pool = require("../config/db");

const getCountries = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM countries ORDER BY name"
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Countries fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Error fetching countries:", error);

    res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch countries",
      errors: ["Internal server error"],
    });
  }
};

const getStatesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    const result = await pool.query(
      `SELECT id, name
       FROM states
       WHERE country_id = $1
       ORDER BY name`,
      [countryId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "States fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Error fetching states:", error);

    res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch states",
      errors: ["Internal server error"],
    });
  }
};

const getAllStates = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        country_id
      FROM states
      ORDER BY name
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
      message: "All states fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Error fetching all states:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch states",
      errors: ["Internal server error"],
    });
  }
};

const getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    const result = await pool.query(
      `SELECT id, name
       FROM cities
       WHERE state_id = $1
       ORDER BY name`,
      [stateId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: "Cities fetched successfully",
      errors: [],
    });
  } catch (error) {
    console.error("Error fetching cities:", error);

    res.status(500).json({
      success: false,
      data: [],
      message: "Failed to fetch cities",
      errors: ["Internal server error"],
    });
  }
};

module.exports = {
  getCountries,
  getStatesByCountry,
  getAllStates,
  getCitiesByState,
};