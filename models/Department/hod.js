const mongoose = require("mongoose");

const HodSchema = new mongoose.Schema({
    employee_id:{
        type: String,
        required: true
    },
    staff_ID: {
        type: String,
        required: true
    },
    hod_first_name: {
        type: String,
        required: true,
    },
    hod_last_name: {
        type: String,
        required: true,
        uppercase: true
    },
    hod_email: {
        type: String,
        required: true,
        lowercase: true
    },
    department: {
        dept_id: {
            type: String,
            required: true
        },
        dept_name: {
            type: String,
            required: true,
            uppercase: true
        }
    },
    no_of_units: {
        type: String,
    },
    no_of_employees: {
        type: String,
    },
    assign_date: {
        type: String,
    }
}, {timestamps: true} );

const Hod = mongoose.model("Hod", HodSchema);
module.exports = Hod;