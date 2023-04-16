const express = require("express");
const router = express.Router();
const {login, logout, loggedIn} = require("../../controllers/Auth/logs");

// admin login
router.post("/login", login);
router.get("/logout", logout)
router.get("/loggedin", loggedIn);

module.exports = router;