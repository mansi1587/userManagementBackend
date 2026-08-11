const express = require("express");

const {
  getCountries,
  getStatesByCountry,
  getAllStates,
  getCitiesByState,
} = require("../controllers/locationController");

const router = express.Router();

router.get("/countries", getCountries);

router.get("/states", getAllStates);

router.get("/states/:countryId", getStatesByCountry);

router.get("/cities/:stateId", getCitiesByState);

module.exports = router;