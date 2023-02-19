const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
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
        required: true,
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