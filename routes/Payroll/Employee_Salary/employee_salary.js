const express = require("express");
const router = express.Router();
const salary_calculator = require("../../../controllers/Payroll/Employee_Salary/employee_salary");
const verifyToken = require("../../../essentials/verifyToken");

// calculate emplyee's salary
router.get("/employee_salary/:employee_id", verifyToken, salary_calculator);

module.exports = router;