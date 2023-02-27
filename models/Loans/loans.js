const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
    staff_ID: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    loan_amount: {
        type: Number,
        required: true
    },
    approval_date: {
        type: String,
        required: true
    },
    employee_ID: {
        type: [
            String
        ],
    },
    loan_duration : {
        from: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        }
    },
    loan_details: {
        type: String,
        required: true,
        lowercase: true
    }
}, {timestamps: true})

const Loans = mongoose.model("Loan", LoanSchema);
module.exports = Loans;