const express = require("express");
const router = express.Router();
const {
    requestLeave,
    getLeaves,
    filterLeave,
    filterLeaveTable } = require("../../controllers/Leave/leave");

// request leave
router.post("/", requestLeave);
// get all leave requests
router.get("/", getLeaves);
// get number of leaves
router.get("/filter_leave", filterLeave);
// get leave filter table
router.get("/filterleave_table", filterLeaveTable)

module.exports = router;