const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    dept_HOD: {
        type: String,
        required: true
    },
    dept_Name: {
        type: String,
        required: true
    },
    unit: {
        type: [
            String
        ],
    }
}, {timestamps: true} );

const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;