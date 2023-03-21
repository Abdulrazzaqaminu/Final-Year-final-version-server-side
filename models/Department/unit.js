const mongoose = require("mongoose");

const UntiSchema = new mongoose.Schema({   
    unit: [{
        unit_name: {
            type: String,
            required: true,
            uppercase: true
        },
        employee_ids: {
            type: [
                String
            ]
        },
        dept_name: {
            type: String,
            required: true,
            uppercase: true
        }
    }],
    dept: {
        dept_id: {
            type: String,
        }, 
        dept_name: {
            type: String,
            required: true,
            uppercase: true
        }
    }
}, {timestamps: true})

const Unit = mongoose.model("Unit", UntiSchema);
module.exports = Unit;