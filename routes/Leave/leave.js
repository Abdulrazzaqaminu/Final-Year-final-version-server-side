const express = require("express");
const router = express.Router();
const {
    requestLeave,
    getLeaves } = require("../../controllers/Leave/leave");

// request leave
router.post("/", requestLeave);
// get all leave requests
router.get("/", getLeaves);

module.exports = router;