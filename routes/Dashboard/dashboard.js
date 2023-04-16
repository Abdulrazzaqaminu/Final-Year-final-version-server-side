const express = require("express");
const router = express.Router();
const dashboardAnalytics = require("../../controllers/Dashboard/dashboard");
const verifyToken = require("../../essentials/verifyToken");

// get analystics
router.get("/", verifyToken, dashboardAnalytics);

module.exports = router;