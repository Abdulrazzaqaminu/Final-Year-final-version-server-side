const mongoose = require("mongoose");

const ExitSchema = mongoose.Schema({
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
    in_time: {
        type: String,
        default: "Checked Out"
    },
    out_time: {
        type: String,
    }
})

const Exit = mongoose.model("Exit", ExitSchema);
module.exports = Exit;