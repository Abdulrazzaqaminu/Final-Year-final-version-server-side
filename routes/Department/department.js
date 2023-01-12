const express = require("express");
const router = express.Router();
const {
    getAllDepartments,
    getSingledepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment } = require("../../controllers/Department/department");

// get all departments
router.get("/", getAllDepartments);
// get single departments
router.get("/:dept_id", getSingledepartment);
// create department
router.post("/", createDepartment);
// update department
router.put("/:dept_id", updateDepartment);
// delete department
router.delete("/:dept_id", deleteDepartment);

module.exports = router;