const express = require("express");
const router = express.Router();
const login = require("../../controllers/Login/login");

// admin login
router.post("/", login);

module.exports = router;