const express = require("express");
const router = express.Router();
const {
    loanPayment,
    getLoans,
    getSingleEmployeeLoan } = require("../../controllers/Loans/loans");
const verifyToken = require("../../essentials/verifyToken");

// loan payment
router.post("/", verifyToken, loanPayment);
// get list of all loans
router.get("/", verifyToken, getLoans);
// get each employees loan history
router.get("/:employee_id", verifyToken, getSingleEmployeeLoan);

module.exports = router;