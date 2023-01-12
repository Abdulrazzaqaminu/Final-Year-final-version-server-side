const express = require("express");
const router = express.Router();
const dashboardAnalytics = require("../../controllers/Dashboard/dashboard");

// get analystics
router.get("/", dashboardAnalytics);

module.exports = router;