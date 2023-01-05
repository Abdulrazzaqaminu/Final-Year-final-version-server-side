const express = require("express");
const router = express.Router();
const {
    loanPayment,
    getLoans
} = require("../../controllers/Loans/loans");

// get list of all loans
router.get("/", getLoans)
// loan payment
router.post("/:employeeID", loanPayment);

module.exports = router;