const express = require("express");
const router = express.Router();
const {
    enrollEmployee,
    getEmployees, 
    getSingleEmployee,
    edit_employee,
    unenroll }  = require("../../controllers/Enrollment/enrollment");

// get list of all employees
router.get("/", getEmployees);
// get single employees
router.get("/:employee_id", getSingleEmployee);
// enroll employees
router.post("/", enrollEmployee);
// edit employee information
router.put("/:employee_id", edit_employee);
// unenroll employee
router.delete("/:employee_id", unenroll);

module.exports = router;