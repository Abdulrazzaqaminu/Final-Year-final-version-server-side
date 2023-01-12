const express = require("express");
const router = express.Router();
const recordAttendance = require('../../../controllers/Attendance/Record/recordAttendance');

// check employee in or out
router.post("/record", recordAttendance);

module.exports = router;