const Leave = require("../../models/Leave/leave");
const Enrollment = require("../../models/Enrollment/enrollment");

const requestLeave = async (req, res, next) => {
    try {     
        const emptyFields = [];
        if(!req.body.staff_ID) {
            emptyFields.push("staff_ID");
        } if(!req.body.leave_type) {
            emptyFields.push("leave_type");
        } if(!req.body.approval_date) {
            emptyFields.push("approval_date");
        } if(!req.body.duration.start) {
            emptyFields.push("start");
        } if(!req.body.duration.end) {
            emptyFields.push("end");
        }
        if(emptyFields.length > 0) {
            res.status(400).json({"Message": "Fill in the appropriate fields", emptyFields})
        } else {
            Enrollment.findOne({staff_ID: req.body.staff_ID}, (error, rs) => {
                if(error) throw error;
                else {
                    if(rs) {
                        let Staff_ID = rs.staff_ID;
                        Enrollment.findOne({staff_ID: Staff_ID, status: "Terminated"}, (error, employee) => {
                            if(error) throw error;
                            else {
                                if(employee) {
                                    res.status(400).json({"Message": "Employee has been terminated"});
                                } else {
                                    Enrollment.findOne({staff_ID: Staff_ID, employee_type: "Full-Time"}, async (error, employee) => {
                                        if(error) throw error;
                                        else {
                                            if(employee) {
                                                let First_Name = employee.first_name;
                                                let Last_Name = employee.last_name;
                                                let Email = employee.email;
                                                let Employee_Gross = employee.gross_salary;
                                                let days_on_leave = Math.ceil((new Date(req.body.duration.end).getTime() - new Date(req.body.duration.start).getTime())/(1000 * 3600 * 24));
                                                Leave.findOne({staff_ID: Staff_ID, status: "On Leave"}, (error, leave) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(leave) {
                                                            res.status(400).json({"Message": "Employee is still on leave"})
                                                        } else {
                                                            Enrollment.findOneAndUpdate({staff_ID: Staff_ID, email: Email}, 
                                                                {
                                                                    status: "On Leave"
                                                                },
                                                                async (error, rs) => {
                                                                if(error) throw error;
                                                                else {
                                                                    if(rs) {
                                                                        if(req.body.leave_type === "Bereavement leave" || req.body.leave_type === "Sabbatical leave" || req.body.leave_type === "Compassionate leave") {
                                                                            const newLeave = new Leave({
                                                                                staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                email: Email, leave_type: req.body.leave_type, 
                                                                                approval_date: req.body.approval_date, paid: false,
                                                                                leave_duration: {
                                                                                    start: req.body.duration.start,
                                                                                    end: req.body.duration.end
                                                                                }, days_on_leave: days_on_leave
                                                                            })  
                                                                            const leave = await newLeave.save();
                                                                            res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                            
                                                                        } else {
                                                                            if(req.body.leave_type === "Casual leave" && days_on_leave > 3) {
                                                                                res.status(400).json({"Message": "Casual leave duration exceeded 3 days"})
                                                                            } else {
                                                                                let number_of_days_worked = days_on_leave / 252;
                                                                                if(Employee_Gross < 30000) {
                                                                                    let netsalary_perleave_days = parseFloat((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                            
                                                                                    const newLeave = new Leave({
                                                                                        staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                        email: Email, leave_type: req.body.leave_type, 
                                                                                        approval_date: req.body.approval_date, 
                                                                                        leave_duration: {
                                                                                            start: req.body.duration.start,
                                                                                            end: req.body.duration.end
                                                                                        }, days_on_leave: days_on_leave,
                                                                                        leave_pay: netsalary_perleave_days,
                                                                                        
                                                                                    })  
                                                                                    const leave = await newLeave.save();
                                                                                    res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                            
                                                                                } else if(Employee_Gross >= 30000 && Employee_Gross < 625000) {
                                                                                    let relief_allowance = 0.2;
                                                                                                                                            
                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                
                                                                                    let taxable_income = Employee_Gross - statutory_relief
                                                                        
                                                                                    let first_300 = taxable_income - 0;
                                                                                    let tax = first_300 * 0.07;
                            
                                                                                    let netsalary = Employee_Gross - tax;
                                                                                    let netsalary_perleave_days = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                            
                                                                                    const newLeave = new Leave({
                                                                                        staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                        email: Email, leave_type: req.body.leave_type, 
                                                                                        approval_date: req.body.approval_date, 
                                                                                        leave_duration: {
                                                                                            start: req.body.duration.start,
                                                                                            end: req.body.duration.end
                                                                                        }, days_on_leave: days_on_leave,
                                                                                        leave_pay: netsalary_perleave_days,
                                                                                    })    
                                                                                    const leave = await newLeave.save();
                                                                                    res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                            
                                                                                } else if(Employee_Gross >= 625000 && Employee_Gross < 1000000) {
                                                                                    let relief_allowance = 0.2;
                                                                                                                                            
                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                
                                                                                    let taxable_income = Employee_Gross - statutory_relief
                            
                                                                                    let first_300 = 300000 * 0.07;
                                                                                    let next_300 = (taxable_income - 300000) * 0.11;
                                                                                    let tax = first_300 + next_300;
                            
                                                                                    let netsalary = Employee_Gross - tax;
                                                                                    let netsalary_perleave_days = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                            
                                                                                    const newLeave = new Leave({
                                                                                        staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                        email: Email, leave_type: req.body.leave_type, 
                                                                                        approval_date: req.body.approval_date, 
                                                                                        leave_duration: {
                                                                                            start: req.body.duration.start,
                                                                                            end: req.body.duration.end
                                                                                        }, days_on_leave: days_on_leave,
                                                                                        leave_pay: netsalary_perleave_days,
                                                                                    })    
                                                                                    const leave = await newLeave.save();
                                                                                    res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                            
                                                                                } else if(Employee_Gross >= 1000000 && Employee_Gross < 2250000) {
                                                                                    let relief_allowance = 0.2;
                                                                                                                                            
                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                
                                                                                    let taxable_income = Employee_Gross - statutory_relief
                            
                                                                                    let first_300 = 300000 * 0.07;
                                                                                    let next_300 = 300000 * 0.11;
                                                                                    let next_500 = 500000 * 0.15;
                                                                                    let next_500_2 = (taxable_income - 1100000) * 0.19;
                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2;
                            
                                                                                    let netsalary = Employee_Gross - tax;
                                                                                    let netsalary_perleave_days = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                            
                                                                                    const newLeave = new Leave({
                                                                                        staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                        email: Email, leave_type: req.body.leave_type, 
                                                                                        approval_date: req.body.approval_date, 
                                                                                        leave_duration: {
                                                                                            start: req.body.duration.start,
                                                                                            end: req.body.duration.end
                                                                                        }, days_on_leave: days_on_leave,
                                                                                        leave_pay: netsalary_perleave_days,
                                                                                    })    
                                                                                    const leave = await newLeave.save();
                                                                                    res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                            
                                                                                } else if(Employee_Gross >= 2250000 && Employee_Gross < 4250000) {
                                                                                    let relief_allowance = 0.2;
                                                                                                                                            
                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                
                                                                                    let taxable_income = Employee_Gross - statutory_relief
                            
                                                                                    let first_300 = 300000 * 0.07;
                                                                                    let next_300 = 300000 * 0.11;
                                                                                    let next_500 = 500000 * 0.15;
                                                                                    let next_500_2 = 500000 * 0.19;
                                                                                    let next_1600 = (taxable_income - 1600000) * 0.21;
                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600;
                            
                                                                                    let netsalary = Employee_Gross - tax;
                                                                                    let netsalary_perleave_days = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                            
                                                                                    const newLeave = new Leave({
                                                                                        staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                        email: Email, leave_type: req.body.leave_type, 
                                                                                        approval_date: req.body.approval_date, 
                                                                                        leave_duration: {
                                                                                            start: req.body.duration.start,
                                                                                            end: req.body.duration.end
                                                                                        }, days_on_leave: days_on_leave,
                                                                                        leave_pay: netsalary_perleave_days,
                                                                                    })    
                                                                                    const leave = await newLeave.save();
                                                                                    res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                            
                                                                                } else if(Employee_Gross >= 4250000) {
                                                                                    let relief_allowance = 0.2;
                                                                                                                                            
                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                
                                                                                    let taxable_income = Employee_Gross - statutory_relief
                            
                                                                                    let first_300 = 300000 * 0.07;
                                                                                    let next_300 = 300000 * 0.11;
                                                                                    let next_500 = 500000 * 0.15;
                                                                                    let next_500_2 = 500000 * 0.19;
                                                                                    let next_1600 = 1600000 * 0.21;
                                                                                    let next_3200 = (taxable_income - 3200000) * 0.24;
                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600 + next_3200;
                            
                                                                                    let netsalary = Employee_Gross - tax;
                                                                                    let netsalary_perleave_days = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                            
                                                                                    const newLeave = new Leave({
                                                                                        staff_ID: Staff_ID, first_name: First_Name, last_name: Last_Name,
                                                                                        email: Email, leave_type: req.body.leave_type, 
                                                                                        approval_date: req.body.approval_date, 
                                                                                        leave_duration: {
                                                                                            start: req.body.duration.start,
                                                                                            end: req.body.duration.end
                                                                                        }, days_on_leave: days_on_leave,
                                                                                        leave_pay: netsalary_perleave_days,
                                                                                    })    
                                                                                    const leave = await newLeave.save();
                                                                                    res.status(200).json({"Message": `Employee will be on leave for ${days_on_leave} days`, leave})
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            } else {
                                                res.status(400).json({"Message": "Employee is contracted"});
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    } else {
                        res.status(404).json({"Message": "Employee not found"});
                    }
                }
            })
        }
    } catch (error) {
        next(error);
    }
}

const getLeaves = async (req, res, next) => {
    try {
        Leave.find({}, (error, leave) => {
            if(error) throw error;
            else {
                if(leave.length > 0) {
                    res.status(200).json(leave);
                } else {
                    res.status(404).json({"Message": "No leave requests", leave})
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    requestLeave,
    getLeaves
};