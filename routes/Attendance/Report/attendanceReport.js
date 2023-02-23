const express = require("express");
const router = express.Router();
const attendanceHistory  = require("../../../controllers/Attendance/Report/attendanceRecord");

// attendnace history list
router.get("/", attendanceHistory);


module.exports = router;