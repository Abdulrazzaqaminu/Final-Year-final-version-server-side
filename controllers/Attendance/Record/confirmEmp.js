const Enrollment = require("../../../models/Enrollment/enrollment");
const Leave = require("../../../models/Leave/leave");

const findEmployee = async (req, res, next) => {
   try {
        Enrollment.find({email: req.body.email}, (error, result) => {
            if(error) throw error;
            else {
                if(result.length > 0) {
                    let Employee_Email = result[0].email;
                    Enrollment.find({email: Employee_Email, status: "Active"}, {qrcode: 0}, (error, employee) => {
                        if(error) throw error;
                        else {
                            if(employee.length > 0) {
                                Leave.findOne({email: Employee_Email, status: "Approved"}, (error, approved) => {
                                    if(error) throw error;
                                    else {
                                        if(approved) {
                                            let day = new Date();
                                            let time = day.getTime()
                                            let timeOffSet = day.getTimezoneOffset()
                                            let current_day = new Date(time - timeOffSet*60*1000).toISOString().substr(0,10).replace('T', ' ');
                                            let leave_start = approved.leave_duration.start;
                                            if(leave_start == current_day) {
                                                Leave.findOneAndUpdate({email: Employee_Email, status: "Approved"}, 
                                                {status: "On Leave"},
                                                (error, leave_upt) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(leave_upt) {
                                                            Enrollment.findOneAndUpdate({email: Employee_Email, status: "Active"}, 
                                                            {status: "On Leave"},
                                                            (error, emp_upt) => {
                                                                if(error) throw error;
                                                                else {
                                                                    if(emp_upt) {
                                                                        res.status(400).json({"Message": "Employee starts leave today"})
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            } else {
                                                res.status(200).json({"Message": "Employee found", employee});
                                            }
                                        } else {
                                            res.status(200).json({"Message": "Employee found", employee});
                                        }
                                    }
                                })
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