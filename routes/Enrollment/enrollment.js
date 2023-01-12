const express = require("express");
const router = express.Router();
const {
    enrollEmployee,
    getEmployees, 
    getSingleEmployee }  = require("../../controllers/Enrollment/enrollment");

// get list of all employees
router.get("/", getEmployees);
// get single employees
router.get("/:employee_id", getSingleEmployee);
// enroll employees
router.post("/", enrollEmployee);

module.exports = router;