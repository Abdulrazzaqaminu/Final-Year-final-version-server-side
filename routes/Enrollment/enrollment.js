const express = require("express");
const router = express.Router();
const {
    enrollEmployee,
    csvEnroll,
    getEmployees, 
    getSingleEmployee,
    edit_employee,
    unenroll,
    employeeFilter,
    employeeDept,
    employeeUnit }  = require("../../controllers/Enrollment/enrollment");
const verifyToken = require("../../essentials/verifyToken");

// get list of all employees
router.get("/", verifyToken, getEmployees);
// get single employees
router.get("/:employee_id", verifyToken, getSingleEmployee);
// enroll employees
router.post("/", verifyToken, enrollEmployee);
// enroll employees using csv file
router.post("/csv", verifyToken, csvEnroll);
// edit employee information
router.put("/:employee_id", verifyToken, edit_employee);
// unenroll employee
router.delete("/:employee_id", verifyToken, unenroll);
// employee filter
router.get('/enroll/employeeFilter', verifyToken, employeeFilter);
router.get('/enroll/employeeFilter/dept', verifyToken, employeeDept);
router.get('/enroll/employeeFilter/unit', verifyToken, employeeUnit);

module.exports = router;