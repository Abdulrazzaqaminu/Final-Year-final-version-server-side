const express = require("express");
const router = express.Router();
const {
    getAllDepartments,
    getSingledepartmentUnit,
    getSingledepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    transfer } = require("../../controllers/Department/department");
const verifyToken = require("../../essentials/verifyToken");

// get all departments
router.get("/", verifyToken, getAllDepartments);
// get single department with units
router.get("/filter", verifyToken, getSingledepartmentUnit);
// get single department
router.get("/filter_department", verifyToken, getSingledepartment);
// create department
router.post("/", verifyToken, createDepartment);
// update department
router.put("/:dept_id", verifyToken, updateDepartment);
// delete department
router.delete("/:dept_id", verifyToken, deleteDepartment);
// transfer employee
router.post("/transfer_employee", verifyToken, transfer);

module.exports = router;