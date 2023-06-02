const express = require("express");
const router = express.Router();
const {localGov, fetchLocalGov} = require("../../controllers/Local_Gov/LocalGov");

// add states and cities
router.post("/state_cities", localGov);
router.get("/getStateCities", fetchLocalGov)

module.exports = router;