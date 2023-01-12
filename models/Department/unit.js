const mongoose = require("mongoose");

const UntiSchema = new mongoose.Schema({   
    dept_id: {
        type: String
    },
    unit_name: {
        type: String,
        required: true
    },
}, {timestamps: true})

const Unit = mongoose.model("Unit", UntiSchema);
module.exports = Unit;