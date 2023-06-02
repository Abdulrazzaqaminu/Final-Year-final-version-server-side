const mongoose = require("mongoose");
const LocalGovSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true
    },
    cities: [{
        type: String,
        required: true
    }]
})

const LocalGov = mongoose.model("Local_Gov", LocalGovSchema);
module.exports = LocalGov