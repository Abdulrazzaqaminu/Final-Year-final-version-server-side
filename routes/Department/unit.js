const express = require("express");
const router = express.Router();
const {
    getAllUnits,
    createUnit,
    updateUnit,
    deleteUnit } = require("../../controllers/Department/unit");

// get all units
router.get("/", getAllUnits)
// create unit
router.post("/:deptid", createUnit)
// update unit
router.put("/:unitid", updateUnit)
// delete unit
router.delete("/:deptid/:unitid", deleteUnit)

module.exports = router;