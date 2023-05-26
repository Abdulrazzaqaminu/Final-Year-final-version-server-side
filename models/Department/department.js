const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    dept_HOD: {
        hod_id: {
            type: String,
            default: "N/A",
        },
        hod_first_name: {
            type: String,
            default: "N/A",
        },
        hod_last_name: {
            type: String,
            default: "N/A",
            uppercase: true
        },
        hod_email: {
            type: String,
            default: "N/A",
            lowercase: true
        },
        hod_assign_date: {
            type: String
        }
    },
    dept_name: {
        type: String,
        required: true,
        uppercase: true
    },
    unit: [{
        unit_name: {
            type: String,
            uppercase: true
        }
    }],
    employee_ids: {
        type: [
            String
        ]
    }
}, {timestamps: true} );

const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;