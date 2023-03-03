const Enrollment = require("../../../models/Enrollment/enrollment");

const findEmployee = async (req, res, next) => {
   try {
        Enrollment.find({email: req.body.email}, (error, result) => {
            if(error) throw error;
            else {
                if(result.length > 0) {
                    Enrollment.findOne({email: req.body.email, status: "Active"},{
                        staff_ID : 1,
                        first_name : 1,
                        last_name : 1,
                        email : 1,
                    },(error, employee) => {
                        if(error) throw error;
                        else {
                            if(employee) {
                                res.status(200).json(employee);
                            } else {
                                res.status(400).json({"Message" : "This card has been terminated"});
                            }
                        }
                    })
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