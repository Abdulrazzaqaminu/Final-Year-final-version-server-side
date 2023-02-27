const mongoose = require("mongoose");

const WorkingHoursSchema = mongoose.Schema({
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
        required: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    date: {
        type: String,
        required: true
    },
    hours: {
        worked_hours: {
            type: Number,
            required: true
        },
        extra_hours: {
            type: Number,
            default: 0
        }
    },
    minutes: {
        type: Number,
        required: true
    },
    seconds: {
        type: Number,
        required: true
    }
}, {timestamps: true} )

const WorkingHours = mongoose.model("working_hours", WorkingHoursSchema);
module.exports = WorkingHours;