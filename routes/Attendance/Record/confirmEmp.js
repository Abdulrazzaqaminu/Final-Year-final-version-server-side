const express = require("express");
const router = express.Router();
const findEmployee = require("../../../controllers/Attendance/Record/confirmEmp");

// confirm if employee exists
router.post("/confirm", findEmployee);

module.exports = router;