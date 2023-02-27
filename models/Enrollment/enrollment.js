const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
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
    date_of_birth: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        min: 11,
        max: 11,
    },
    department: {
        type: String,
        required: true,
        default: "N/A",
        uppercase: true
    },
    unit: {
        type: String,
        required: true,
        default: "N/A",
        uppercase: true
    },
    position: {
        type: String,
        required: true,
        min: 1,
        max: 3,
    },
    grade: {
        type: String,
        required: true,
        min: 1,
        max: 3,
    },
    employee_type: {
        type: String,
        required: true,
    },
    enrollment_date: {
        type: String,
        required: true
    },
    gross_salary:{
        type: Number,
        required: true
    },
    address: {
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        default: "Active"
    },
    qrcode: {
        type: String,
        required: true
    }
}, {timestamps: true} )

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);
module.exports = Enrollment;