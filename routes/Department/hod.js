const express = require("express");
const router = express.Router();
const {
    assign_hod,
    getAllHods,
    getSingleHod,
    removeHod } = require("../../controllers/Department/hod");
const verifyToken = require("../../essentials/verifyToken");

// assign HOD to department
router.put("/:dept_id", verifyToken, assign_hod);
// get list of HOD's
router.get("/", getAllHods);
// get single HOD
router.get("/:hod_id", verifyToken, getSingleHod);
// remove employee as HOD
router.delete("/:hod_id", verifyToken, removeHod);

module.exports = router;