const express = require("express");
const router = express.Router();
const {
    getSpecificPayroll,
    getPayrolls } = require("../../controllers/Payroll/payroll");

// get list of all the payrolls
router.get("/", getPayrolls);
// get specific payroll
router.get("/:employee_id", getSpecificPayroll);

module.exports = router;