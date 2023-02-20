const express = require("express");
const router = express.Router();
const {
    loanPayment,
    getLoans,
    getSingleEmployeeLoan,
    clearLoan } = require("../../controllers/Loans/loans");

// loan payment
router.post("/", loanPayment);
// get list of all loans
router.get("/", getLoans);
// get each employees loan history
router.get("/:employee_id", getSingleEmployeeLoan);
// clear employee loan
router.put("/:employee_id", clearLoan);

module.exports = router;