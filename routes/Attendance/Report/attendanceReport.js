const express = require("express");
const router = express.Router();
const {
    attendanceHistory,
    attendanceFilter}  = require("../../../controllers/Attendance/Report/attendanceReport");

// attendnace history list
router.get("/", attendanceHistory);
// attendnace filter list
router.get("/filter_date", attendanceFilter);


module.exports = router;