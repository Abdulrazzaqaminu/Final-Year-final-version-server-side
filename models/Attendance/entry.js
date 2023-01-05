const mongoose = require("mongoose");

const EntrySchema = mongoose.Schema({
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
    },
    out_time: {
        type: String,
        default: "Still In"
    }
})

const Entry = mongoose.model("Entry", EntrySchema);
module.exports = Entry;