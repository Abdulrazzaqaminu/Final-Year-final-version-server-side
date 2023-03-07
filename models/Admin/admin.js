const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;