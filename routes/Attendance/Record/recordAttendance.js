const express = require("express");
const router = express.Router();
const recordAttendance = require('../../../controllers/Attendance/Record/recordAttendance');

router.post("/record", recordAttendance)

module.exports = router;