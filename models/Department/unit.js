const mongoose = require("mongoose");

const UntiSchema = new mongoose.Schema({
    unit_Name: {
        type: String,
        required: true
    }
})

const Unit = mongoose.model("Unit", UntiSchema);
module.exports = Unit;