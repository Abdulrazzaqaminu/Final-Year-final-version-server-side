const express = require("express");
const router = express.Router();
const filterAll = require("../../controllers/FilterAll/filterAll");
const verifyToken = require("../../essentials/verifyToken");

// get filter results
router.get("/", /*verifyToken,*/ filterAll);

module.exports = router;