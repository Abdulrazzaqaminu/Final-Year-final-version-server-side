const express = require("express");
const router = express.Router();
const {
    loanPayment,
    getLoans,
    getSingleEmployeeLoan,
    clearLoan } = require("../../controllers/Loans/loans");
const verifyToken = require("../../essentials/verifyToken");

// loan payment
router.post("/", verifyToken, loanPayment);
// get list of all loans
router.get("/", verifyToken, getLoans);
// get each employees loan history
router.get("/:employee_id", verifyToken, getSingleEmployeeLoan);
// clear employee loan
router.put("/:employee_id", verifyToken, clearLoan);

module.exports = router;