const express = require("express");
const router = express.Router();
const salary_calculator = require("../../../controllers/Payroll/Employee_Salary/employee_salary");

// calculate emplyee's salary
router.get("/employee_salary/:employee_id", salary_calculator);

module.exports = router;