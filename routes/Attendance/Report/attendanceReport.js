const express = require("express");
const router = express.Router();
const {
    filter_by_date,
    attendanceHistory } = require("../../../controllers/Attendance/Report/attendanceRecord");

// attendnace history list
router.get("/", attendanceHistory);
// sepcific result by filtering by date
router.post("/filter_by_date", filter_by_date);

module.exports = router;