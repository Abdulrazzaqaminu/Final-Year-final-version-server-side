const Enrollment = require("../../../models/Enrollment/enrollment");

const findEmployee = async (req, res, next) => {
   try {
        Enrollment.find({email: req.body.email}, {
            staff_ID : 1,
            first_name : 1,
            last_name : 1,
            email : 1,
        }, (error, result) => {
            if(error) throw error;
            else {
                if(result.length > 0) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({"Message" : "Employee not found"});
                }
            }
        })
   } catch (error) {
        next(error);
   }
}

module.exports = findEmployee;