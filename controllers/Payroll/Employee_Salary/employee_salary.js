const Enrollment = require("../../../models/Enrollment/enrollment");
const Payroll = require("../../../models/Payroll/payroll");
const WorkingHours = require("../../../models/Attendance/working_hours");
const DailyPay = require("../../../models/Daily_Pay/daily_pay");
const Leave = require("../../../models/Leave/leave");

const salary_calculator = async (req, res, next) =>{
    // number of weekends in current month
    function daysInMonth(month,year) {
        return new Date(year, month, 0).getDate();
    }
    var day = new Date();
    var number_of_days_in_a_month = daysInMonth(day.getMonth(),day.getFullYear());
    var weekends = new Array();
    for(var i=1; i <= number_of_days_in_a_month; i++){
        var newDate = new Date(day.getFullYear(),day.getMonth(),i)
        if(newDate.getDay()==0 || newDate.getDay()==6){
        weekends.push(i)
        }
    }
    let today = new Date();
    let options = {
        month: "long"
    }
    let month = today.toLocaleDateString("en-us", options)
    // console.log("current month = "+month);
    let weekend_length = weekends.length
    // console.log('There are '+weekend_length+' weekends in '+month);

    // number of days in current month
    let getDays = (year, month) => {
        return new Date(year, month, 0).getDate();
    };
    
    let days_in_the_month = getDays(new Date().getFullYear(), 7);
    // console.log('There are '+days_in_the_month+' days in '+month);

    // calculating number of working days in current month
    let working_days = days_in_the_month - weekend_length;
    // console.log("There are "+working_days+" working days in "+month);

    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.find({_id: Employee_ID}, (error, rs) => {
            if(error) throw error;
            else {
                if(rs.length > 0) {
                    let Staff_ID = rs[0].staff_ID;
                    let Employee_First_Name = rs[0].first_name;
                    let Employee_Last_Name = rs[0].last_name;
                    let Employee_Position = rs[0].position;
                    let Employee_Grade = rs[0].grade;
                    let Employee_Type = rs[0].employee_type;
                    let email = rs[0].email;

                    let Employee_Gross = parseFloat((((rs[0].gross_salary).toFixed(2)).toLocaleString()).replace(/,/g,''));
                    let Employee_Gross_formatted = (Employee_Gross).toLocaleString();
                    Payroll.find({employee_id: Employee_ID}, (error, employee) =>{
                        if(error) throw error;
                        else{
                            if(employee.length > 0) {
                                // console.log(email+" "+gross);
                                // console.log(empInfo);
                                Leave.aggregate([
                                    {
                                        $match: {
                                            email: email
                                        }
                                    },
                                    {
                                        $group: {
                                            _id: "$email",
                                            total_leave_pay: {
                                                $sum: "$leave_pay"
                                            }
                                        }
                                    }
                                ], (error, rs) => {
                                    if(error) throw error;
                                    else {
                                        if(rs.length > 0) {
                                            let leave_pay = parseFloat((((rs[0].total_leave_pay).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                            let leave_pay_formatted = (leave_pay).toLocaleString();
                                            WorkingHours.aggregate([
                                                {
                                                    // checking if emails match
                                                    $match: {
                                                        email: email,
                                                    }
                                                },
                                                {
                                                    // suming up employees hours worked
                                                    $group: {
                                                        _id: "$email",
                                                        total_hours: {
                                                            $sum: "$hours.worked_hours"
                                                        },
                                                        total_extra_hours: {
                                                            $sum: "$hours.extra_hours"
                                                        },
                                                        days_worked: {
                                                            $sum: 1
                                                        }                     
                                                    } 
                                                },
                                            ],  (error, employee) => {
                                                if(error) throw error;
                                                else {
                                                    if(employee.length > 0) {
                                                        let total_hours_worked = employee[0].total_hours;
                                                        let total_worked_days = employee[0].days_worked;
                                                        let total_overtime_hours = employee[0].total_extra_hours;
                                                        DailyPay.aggregate([
                                                            {
                                                                $match: {
                                                                    email: email
                                                                }
                                                            },
                                                            {
                                                                $group: {
                                                                    _id: "$email",
                                                                    total_netsalary: {
                                                                        $sum: "$net_salary.netsalary"
                                                                    }
                                                                }
                                                            }
                                                        ], (error, rs) => {
                                                            if(error) throw error
                                                            else {
                                                                const Net_Salary = parseFloat((((rs[0].total_netsalary).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                const Net_Salary_Formatted = (Net_Salary).toLocaleString();
                                                                if(Employee_Type === "Full-Time") {
                                                                    res.status(200).json({
                                                                        "Staff_ID" : Staff_ID,
                                                                        "First_Name" : Employee_First_Name,
                                                                        "Last_Name" : Employee_Last_Name,
                                                                        "Employee_Email": email,
                                                                        "Position" : Employee_Position,
                                                                        "Grade" : Employee_Grade,
                                                                        "Employee_Type": Employee_Type,
                                                                        "Days_Worked": total_worked_days,
                                                                        "Hours_Worked": total_hours_worked,
                                                                        "Extra_Hours": total_overtime_hours,
                                                                        "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                        "Leave_Pay": `NGN ${leave_pay_formatted}`,
                                                                        "Net_Salary": `NGN ${Net_Salary_Formatted}`
                                                                    });
                                                                } else {
                                                                    res.status(200).json({
                                                                        "Staff_ID" : Staff_ID,
                                                                        "First_Name" : Employee_First_Name,
                                                                        "Last_Name" : Employee_Last_Name,
                                                                        "Employee_Email": email,
                                                                        "Position" : Employee_Position,
                                                                        "Grade" : Employee_Grade,
                                                                        "Employee_Type": Employee_Type,
                                                                        "Days_Worked": total_worked_days,
                                                                        "Hours_Worked": total_hours_worked,
                                                                        "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                        "Net_Salary": `NGN ${Net_Salary_Formatted}`
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        if(Employee_Type === "Full-Time") {
                                                            const employee = {
                                                                "Staff_ID" : Staff_ID,
                                                                "First_Name" : Employee_First_Name,
                                                                "Last_Name" : Employee_Last_Name,
                                                                "Employee_Email": email,
                                                                "Position" : Employee_Position,
                                                                "Grade" : Employee_Grade,
                                                                "Employee_Type": Employee_Type,
                                                                "Days_Worked": 0,
                                                                "Hours_Worked": 0,
                                                                "Extra_Hours": 0,
                                                                "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                "Leave_Pay": "NGN 0.00",
                                                                "Net_Salary": "NGN 0.00"
                                                            }
                                                            res.status(400).json({"Message": "Employee is yet to start work", employee});
                                                        } else {
                                                            const employee = {
                                                                "Staff_ID" : Staff_ID,
                                                                "First_Name" : Employee_First_Name,
                                                                "Last_Name" : Employee_Last_Name,
                                                                "Employee_Email": email,
                                                                "Position" : Employee_Position,
                                                                "Grade" : Employee_Grade,
                                                                "Employee_Type": Employee_Type,
                                                                "Days_Worked": 0,
                                                                "Hours_Worked": 0,
                                                                "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                "Net_Salary": "NGN 0.00"
                                                            }
                                                            res.status(400).json({"Message": "Employee is yet to start work", employee});
                                                        }
                                                    }
                                                }
                                            })
                                        } else {
                                            WorkingHours.aggregate([
                                                {
                                                    // checking if emails match
                                                    $match: {
                                                        email: email,
                                                   }
                                                },
                                                {
                                                    // suming up employees hours worked
                                                    $group: {
                                                        _id: "$email",
                                                        total_hours: {
                                                            $sum: "$hours.worked_hours"
                                                        },
                                                        total_extra_hours: {
                                                            $sum: "$hours.extra_hours"
                                                        },
                                                        days_worked: {
                                                            $sum: 1
                                                        }                     
                                                    } 
                                                },
                                            ],  (error, employee) => {
                                                if(error) throw error;
                                                else {
                                                    if(employee.length > 0) {
                                                        let total_hours_worked = employee[0].total_hours;
                                                        let total_worked_days = employee[0].days_worked;
                                                        let total_overtime_hours = employee[0].total_extra_hours;
                                                        DailyPay.aggregate([
                                                            {
                                                                $match: {
                                                                    email: email
                                                                }
                                                            },
                                                            {
                                                                $group: {
                                                                    _id: "$email",
                                                                    total_netsalary: {
                                                                        $sum: "$net_salary.netsalary"
                                                                    }
                                                                }
                                                            }
                                                        ], (error, rs) => {
                                                            if(error) throw error
                                                            else {
                                                                const Net_Salary = parseFloat((((rs[0].total_netsalary).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                const Net_Salary_Formatted = (Net_Salary).toLocaleString();
                                                                if(Employee_Type === "Full-Time") {
                                                                    res.status(200).json({
                                                                        "Staff_ID" : Staff_ID,
                                                                        "First_Name" : Employee_First_Name,
                                                                        "Last_Name" : Employee_Last_Name,
                                                                        "Employee_Email": email,
                                                                        "Position" : Employee_Position,
                                                                        "Grade" : Employee_Grade,
                                                                        "Employee_Type": Employee_Type,
                                                                        "Days_Worked": total_worked_days,
                                                                        "Hours_Worked": total_hours_worked,
                                                                        "Extra_Hours": total_overtime_hours,
                                                                        "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                        "Leave_Pay": "NGN 0.00",
                                                                        "Net_Salary": `NGN ${Net_Salary_Formatted}`
                                                                    });
                                                                } else {
                                                                    res.status(200).json({
                                                                        "Staff_ID" : Staff_ID,
                                                                        "First_Name" : Employee_First_Name,
                                                                        "Last_Name" : Employee_Last_Name,
                                                                        "Employee_Email": email,
                                                                        "Position" : Employee_Position,
                                                                        "Grade" : Employee_Grade,
                                                                        "Employee_Type": Employee_Type,
                                                                        "Days_Worked": total_worked_days,
                                                                        "Hours_Worked": total_hours_worked,
                                                                        "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                        "Net_Salary": `NGN ${Net_Salary_Formatted}`
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        if(Employee_Type === "Full-Time") {
                                                            const employee = {
                                                                "Staff_ID" : Staff_ID,
                                                                "First_Name" : Employee_First_Name,
                                                                "Last_Name" : Employee_Last_Name,
                                                                "Employee_Email": email,
                                                                "Position" : Employee_Position,
                                                                "Grade" : Employee_Grade,
                                                                "Employee_Type": Employee_Type,
                                                                "Days_Worked": 0,
                                                                "Hours_Worked": 0,
                                                                "Extra_Hours": 0,
                                                                "Leave_Pay": "NGN 0.00",
                                                                "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                "Net_Salary": "NGN 0.00"
                                                            }
                                                            res.status(400).json({"Message": "Employee is yet to start work", employee});
                                                        } else {
                                                            const employee = {
                                                                "Staff_ID" : Staff_ID,
                                                                "First_Name" : Employee_First_Name,
                                                                "Last_Name" : Employee_Last_Name,
                                                                "Employee_Email": email,
                                                                "Position" : Employee_Position,
                                                                "Grade" : Employee_Grade,
                                                                "Employee_Type": Employee_Type,
                                                                "Days_Worked": 0,
                                                                "Employee_Gross": `NGN ${Employee_Gross_formatted}`,
                                                                "Hours_Worked": 0,
                                                                "Net_Salary": "NGN 0.00"
                                                            }
                                                            res.status(400).json({"Message": "Employee is yet to start work", employee});
                                                        }
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
                } else {
                    res.status(404).json({"Message": "Employee not found"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = salary_calculator