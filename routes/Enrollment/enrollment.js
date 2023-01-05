const express = require("express");
const router = express.Router();
const {
    enrollEmployee,
    getEmployees }  = require("../../controllers/Enrollment/enrollment");

// get list of all employees
router.get("/", getEmployees)
// enroll employees
router.post("/", enrollEmployee)

module.exports = router;