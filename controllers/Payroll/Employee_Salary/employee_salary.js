// const Enrollment = require("../../../models/Enrollment/enrollment");
const Payroll = require("../../../models/Payroll/payroll");
const WorkingHours = require("../../../models/Attendance/working_hours");
const DailyPay = require("../../../models/Daily_Pay/daily_pay");

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
        Payroll.find({employee_id: Employee_ID}, (error, employee) =>{
            if(error) throw error;
            else{
                if(employee.length > 0) {
                    let empInfo = employee[0];
                    let Staff_ID = employee[0].staff_ID;
                    let Employee_First_Name = employee[0].first_name;
                    let Employee_Last_Name = employee[0].last_name;
                    let Employee_Type = employee[0].employee_type;
                    let email = employee[0].email;
                    // console.log(email+" "+gross);
                    // console.log(empInfo);

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
                                days_worked: {
                                    $sum: 1
                                }                     
                            } 
                        },
                    ],  (error, employee_worked_hours) => {
                        if(error) throw error;
                        else {
                            if(employee_worked_hours.length > 0) {
                                let total_hours_worked = employee_worked_hours[0].total_hours;
                                let total_worked_days = employee_worked_hours[0].days_worked;

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
                                                "Staff ID" : Staff_ID,
                                                "First Name" : Employee_First_Name,
                                                "Last Name" : Employee_Last_Name,
                                                "Employee Email": email,
                                                "Position" : empInfo.position,
                                                "Grade" : empInfo.grade,
                                                "Employee Type": Employee_Type,
                                                "Days Worked": total_worked_days,
                                                "Hours Worked": total_hours_worked,
                                                "Net Salary (per total days worked)": `${"NGN "+Net_Salary_Formatted}`
                                            });
                                        } else {
                                            res.status(200).json({
                                                "Staff ID" : Staff_ID,
                                                "First Name" : Employee_First_Name,
                                                "Last Name" : Employee_Last_Name,
                                                "Employee Email": email,
                                                "Position" : empInfo.position,
                                                "Grade" : empInfo.grade,
                                                "Employee Type": Employee_Type,
                                                "Days Worked": total_worked_days,
                                                "Hours Worked": total_hours_worked,
                                                "Net Salary (per total hours worked)": `${"NGN "+Net_Salary_Formatted}`
                                            });
                                        }
                                    }
                                });
                            } else {
                                res.status(200).json({"Message": "Employee has no working hours"});
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