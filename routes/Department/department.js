const express = require("express");
const router = express.Router();
const {
    getAllDepartments,
    getSingledepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    transfer } = require("../../controllers/Department/department");

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
// transfer employee
router.post("/transfer_employee", transfer);

module.exports = router;