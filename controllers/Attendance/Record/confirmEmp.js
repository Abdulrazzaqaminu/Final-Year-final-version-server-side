const Enrollment = require("../../../models/Enrollment/enrollment");

const findEmployee = async (req, res, next) =>{
    try {
        const confirmEmployee = await Enrollment.find({"email": req.body.email}, {
            "staff_ID" : 1,
            "first_name" : 1,
            "last_name" : 1,
            "department" : 1,             
        })
        res.status(404).json(confirmEmployee);
    } catch (error) {
        next(error);
    }
}

module.exports = findEmployee;