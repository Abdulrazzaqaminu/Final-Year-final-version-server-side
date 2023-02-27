const mongoose = require("mongoose");

const DailyPaySchema = new mongoose.Schema({
    staff_ID: {
        type: String,
        required: true
    },
    employee_ID: {
        type: [
            String
        ],
    },
    first_name: {
        type: String,
        required: true
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
    position: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
    },
    grade: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
    },
    gross_salary:{
        type: Number,
        required: true
    },
    hours_worked: {
        worked_hours: {
            type: Number,
            required: true
        },
        overtime: {
            type: String,
            default: "No Overtime"
        },
        extra_hours: {
            type: Number,
            default: 0
        }
    },
    date: {
        type: String,
        required: true
    },
    net_salary: {
        days_worked: {
            type: Number,
            required: true
        },
        overtime_pay: {
            type: Number,
            default: 0
        },
        netsalary: {
            type: Number,
            required: true
        }
    }
}, {timestamps: true})

const DailyPay = mongoose.model("daily_pay", DailyPaySchema);
module.exports = DailyPay;