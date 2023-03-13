const Enrollment = require("../../../models/Enrollment/enrollment");
const Leave = require("../../../models/Leave/leave");

const findEmployee = async (req, res, next) => {
   try {
        Enrollment.find({email: req.body.email}, (error, result) => {
            if(error) throw error;
            else {
                if(result.length > 0) {
                    let Employee_Email = result[0].email;
                    Enrollment.find({email: Employee_Email, status: "Active"}, (error, employee) => {
                        if(error) throw error;
                        else {
                            if(employee.length > 0) {
                                res.status(200).json({"Message": "Employee found", employee});
                            } else {
                                Enrollment.findOne({email: Employee_Email, status: "On Leave"}, (error, employee) => {
                                    if(error) throw error;
                                    else {
                                        if(employee) {
                                            Leave.findOne({email: Employee_Email, status: "On Leave"}, (error, emp_leave) => {
                                                if(error) throw error;
                                                else {
                                                    if(emp_leave) {
                                                        let duration_start = emp_leave.leave_duration.start
                                                        let days_between = Math.ceil((new Date().setHours(0,0,0,0) - new Date(duration_start).getTime())/(1000 * 3600 * 24));
                                                        console.log(days_between);
                                                        Leave.findOne({
                                                            email: Employee_Email, 
                                                            status: "On Leave",
                                                            days_on_leave: {$lt: days_between}
                                                        }, (error, emp_active) => {
                                                            if(error) throw error;
                                                            else {
                                                                if(emp_active) {
                                                                    Leave.findOneAndUpdate({email: Employee_Email, status: "On Leave"}, 
                                                                    {status: "Active"},
                                                                    (error, updated_leave) => {
                                                                        if(error) throw error;
                                                                        else {
                                                                            if(updated_leave) {
                                                                                Enrollment.findOneAndUpdate({email: Employee_Email, status: "On Leave"}, 
                                                                                {status: "Active"},
                                                                                (error, employee) => {
                                                                                    if(error) throw error;
                                                                                    else {
                                                                                        if(employee) {
                                                                                            Enrollment.find({email: Employee_Email, status: "Active"}, (error, employee) => {
                                                                                                if(error) throw error;
                                                                                                else {
                                                                                                    if(employee.length > 0) {
                                                                                                        res.status(200).json({"Message": "Employee found", employee});
                                                                                                    }
                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                })
                                                                            }
                                                                        }
                                                                    })
                                                                } else {
                                                                    res.status(400).json({"Message" : "Employee is still on leave"});
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        } else {
                                            res.status(400).json({"Message" : "This card has been terminated"});
                                        }
                                    }
                                })
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