const mongoose = require("mongoose");
const Enrollment = require("../Enrollment/enrollment");

const PayrollSchema = new mongoose.Schema({
    staff_ID: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    employee_type: {
        type: String,
        required: true
    },
    enrollment_date: {
        type: String,
        required: true
    },
    employee_id: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: Enrollment
        }
    ],
    loans: {
        type: [
            Number
        ],
    },
    annual_gross: {
        type: Number,
        required: true
    }
}, {timestamps: true})

const Payroll = mongoose.model("Payroll", PayrollSchema);
module.exports = Payroll;