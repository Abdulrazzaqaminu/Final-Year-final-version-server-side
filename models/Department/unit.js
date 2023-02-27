const mongoose = require("mongoose");

const UntiSchema = new mongoose.Schema({   
    unit_name: {
        type: String,
        required: true,
        uppercase: true
    },
    dept: {
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
    employee_ids: {
        type: [
            String
        ]
    }
}, {timestamps: true})

const Unit = mongoose.model("Unit", UntiSchema);
module.exports = Unit;