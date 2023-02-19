const express = require("express");
const router = express.Router();
const dashboardAnalytics = require("../../controllers/Dashboard/dashboard");
const verifyToken = require("../../essentials/verifyToken");

// router.get("/checkauthentication", verifyToken, (req, res, next) => {
//     res.send("Hello you are logged in")
// })

// get analystics
router.get("/", dashboardAnalytics);

module.exports = router;