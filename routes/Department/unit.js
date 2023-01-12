const express = require("express");
const router = express.Router();
const {
    getAllUnitsUnderDepartment,
    createUnit,
    updateUnit,
    deleteUnit } = require("../../controllers/Department/unit");

// get all units under department
router.get("/:dept_id", getAllUnitsUnderDepartment);
// create unit
router.post("/:dept_id", createUnit);
// update unit
router.put("/:dept_id/:unit_id", updateUnit);
// delete unit
router.delete("/:dept_id/:unit_id", deleteUnit);

module.exports = router;