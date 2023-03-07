const mongoose = require("mongoose");
const LeaveSchema = new mongoose.Schema({
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
    leave_type: {
        type: String,
        required: true
    },
    approval_date: {
        type: String,
        required: true
    },
    leave_duration : {
        start: {
            type: String,
            required: true
        },
        end: {
            type: String,
            required: true
        }
    },
    paid: {
        type: Boolean,
        default: true
    },
    days_on_leave: {
        type: Number
    },
    leave_pay: {
        type: Number
    },
    status: {
        type: String,
        default: "On Leave"
    }
}, {timestamps: true})

const Leave = mongoose.model("Leave", LeaveSchema);
module.exports = Leave;