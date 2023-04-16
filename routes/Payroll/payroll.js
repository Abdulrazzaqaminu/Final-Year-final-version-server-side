const express = require("express");
const router = express.Router();
const {
    getSpecificPayroll,
    getPayrolls } = require("../../controllers/Payroll/payroll");
const verifyToken = require("../../essentials/verifyToken");

// get list of all the payrolls
router.get("/", verifyToken, getPayrolls);
// get specific payroll
router.get("/:employee_id", verifyToken, getSpecificPayroll);

module.exports = router;