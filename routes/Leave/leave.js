const express = require("express");
const router = express.Router();
const {
    requestLeave,
    getLeaves,
    filterLeave,
    filterLeaveTable } = require("../../controllers/Leave/leave");
const verifyToken = require("../../essentials/verifyToken");

// request leave
router.post("/", verifyToken, requestLeave);
// get all leave requests
router.get("/", verifyToken, getLeaves);
// get number of leaves
router.get("/filter_leave", verifyToken, filterLeave);
// get leave filter table
router.get("/filterleave_table", verifyToken, filterLeaveTable)

module.exports = router;