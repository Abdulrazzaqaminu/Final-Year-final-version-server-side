const express = require("express");
const router = express.Router();
const {
    assign_hod,
    getAllHods,
    getSingleHod,
    removeHod } = require("../../controllers/Department/hod");

// assign HOD to department
router.put("/:dept_id", assign_hod);
// get list of HOD's
router.get("/", getAllHods);
// get single HOD
router.get("/:hod_id", getSingleHod);
// remove employee as HOD
router.delete("/:dept_id/:hod_id", removeHod);

module.exports = router;