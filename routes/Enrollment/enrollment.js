const express = require("express");
const router = express.Router();
const {
    enrollEmployee,
    getEmployees, 
    getSingleEmployee,
    edit_employee,
    unenroll }  = require("../../controllers/Enrollment/enrollment");
const verifyToken = require("../../essentials/verifyToken");

// get list of all employees
router.get("/", verifyToken, getEmployees);
// get single employees
router.get("/:employee_id", verifyToken, getSingleEmployee);
// enroll employees
router.post("/", verifyToken, enrollEmployee);
// edit employee information
router.put("/:employee_id", verifyToken, edit_employee);
// unenroll employee
router.delete("/:employee_id", verifyToken, unenroll);

module.exports = router;