const express = require("express");
const router = express.Router();
const {
    getAllUnitsUnderDepartment,
    createUnit,
    updateUnit,
    deleteUnit } = require("../../controllers/Department/unit");
const verifyToken = require("../../essentials/verifyToken");

// get all units under department
router.get("/:dept_id", verifyToken, getAllUnitsUnderDepartment);
// create unit
router.post("/:dept_id", verifyToken, createUnit);
// update unit
router.put("/:dept_id/:unit_id", verifyToken, updateUnit);
// delete unit
router.delete("/:dept_id/:unit_id", verifyToken, deleteUnit);

module.exports = router;