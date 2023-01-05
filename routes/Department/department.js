const express = require("express");
const router = express.Router();
const {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment } = require("../../controllers/Department/department");

// get all departments
router.get("/", getAllDepartments)
// create department
router.post("/", createDepartment)
// update department
router.put("/:deptid", updateDepartment)
// delete department
router.delete("/:deptid", deleteDepartment)

module.exports = router;