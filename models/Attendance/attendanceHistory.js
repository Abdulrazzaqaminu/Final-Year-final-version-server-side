const mongoose = require("mongoose");

const AttendanceHistorySchema = mongoose.Schema({
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
    date: {
        type: String,
        required: true
    },
    in_time: {
        type: String,
        default: "Checked Out"
    },
    out_time: {
        type: String,
        default: "Still In"
    }
})

const AttendanceHistory = mongoose.model("Attendance_History", AttendanceHistorySchema);
module.exports = AttendanceHistory;