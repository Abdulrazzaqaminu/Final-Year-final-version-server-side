// const Enrollment = require("../../../models/Enrollment/enrollment");
const Payroll = require("../../../models/Payroll/payroll");
const WorkingHours = require("../../../models/Attendance/working_hours");

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
                    let email = employee[0].email;
                    let empInfo = employee[0];
                    let gross = employee[0].annual_gross;
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
                            // suming up employees hours wokred
                            $group: {
                                _id: "$email",
                                total_hours: {
                                    $sum: "$hours"
                                }, 
                                days_worked: {
                                    $sum: 1
                                }                     
                            } 
                        },
                    ], (error, employee_hours_worked) => {
                        if(error) throw error;
                        else {
                            if(employee_hours_worked.length > 0) {
                                let hours_worked = employee_hours_worked[0].total_hours;
                                let days_worked = employee_hours_worked[0].days_worked;
                                let total_working_hours = 40 * 52;

                                if(gross < 30000) {
                                    let netsalary_perhour = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                    // .toFixed(2); two decimal points;
                                    res.status(200).json({
                                        "Staff ID" : empInfo.staff_ID,
                                        "First Name" : empInfo.first_name,
                                        "Last Name" : empInfo.last_name,
                                        "Employee Email": employee_hours_worked[0]._id,
                                        "Position" : empInfo.position,
                                        "Grade" : empInfo.grade,
                                        "Days Worked": days_worked,
                                        "Hours Worked": hours_worked,
                                        "Tax (per hour)": 0,
                                        "Net Salary (per hour)": netsalary_perhour_formatted
                                    });
                                } else if(gross >= 30000 && gross < 625000) {
                                    let relief_allowance = 0.2;
                                    
                                    let statutory_relief = gross * relief_allowance + 200000;
                                    let statutory_relief_perhour = parseFloat((((statutory_relief / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                    
                                    let gross_perhour = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();

                                    let taxable_income = gross - statutory_relief;
                                    let taxable_income_perhour = parseFloat((((taxable_income / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');

                                    let first_300 = taxable_income - 0;

                                    let tax = first_300 * 0.07;
                                    let tax_perhour =  parseFloat((((tax / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();

                                    let netsalary = gross - tax;
                                    let netsalary_perhour = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                    res.status(200).json({
                                        "Staff ID" : empInfo.staff_ID,
                                        "First Name" : empInfo.first_name,
                                        "Last Name" : empInfo.last_name,
                                        "Employee Email": employee_hours_worked[0]._id,
                                        "Position" : empInfo.position,
                                        "Grade" : empInfo.grade,
                                        "Days Worked": days_worked,
                                        "Hours Worked": hours_worked,
                                        "Tax (per hour)": tax_perhour_formatted,
                                        "Net Salary (per hour)": netsalary_perhour_formatted
                                    });
                                } else if(gross >= 625000 && gross < 1000000) {
                                    let relief_allowance = 0.2;

                                    let statutory_relief = gross * relief_allowance + 200000;
                                    let statutory_relief_perhour = parseFloat((((statutory_relief / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();

                                    let gross_perhour = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();

                                    let taxable_income = gross - statutory_relief;
                                    let taxable_income_perhour = parseFloat((((taxable_income / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');

                                    let first_300 = 300000 * 0.07;
                                    let next_300 = (taxable_income - 300000) * 0.11;

                                    let tax = first_300 + next_300;
                                    let tax_perhour =  parseFloat((((tax / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();

                                    let netsalary = gross - tax;
                                    let netsalary_perhour = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                    res.status(200).json({
                                        "Staff ID" : empInfo.staff_ID,
                                        "First Name" : empInfo.first_name,
                                        "Last Name" : empInfo.last_name,
                                        "Employee Email": employee_hours_worked[0]._id,
                                        "Position" : empInfo.position,
                                        "Grade" : empInfo.grade,
                                        "Days Worked": days_worked,
                                        "Hours Worked": hours_worked,
                                        "Tax (per hour)": tax_perhour_formatted,
                                        "Net Salary (per hour)": netsalary_perhour_formatted
                                    });
                                } else if(gross >= 1000000 && gross < 2250000) {
                                    let relief_allowance = 0.2;

                                    let statutory_relief = gross * relief_allowance + 200000;
                                    let statutory_relief_perhour = parseFloat((((statutory_relief / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();

                                    let gross_perhour = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();

                                    let taxable_income = gross - statutory_relief;
                                    let taxable_income_perhour = parseFloat((((taxable_income / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');

                                    let first_300 = 300000 * 0.07;
                                    let next_300 = 300000 * 0.11;
                                    let next_500 = 500000 * 0.15;
                                    let next_500_2 = (taxable_income - 1100000) * 0.19;
                        
                                    let tax = first_300 + next_300 + next_500 + next_500_2;
                                    let tax_perhour =  parseFloat((((tax / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();

                                    let netsalary = gross - tax;
                                    let netsalary_perhour = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                    res.status(200).json({
                                        "Staff ID" : empInfo.staff_ID,
                                        "First Name" : empInfo.first_name,
                                        "Last Name" : empInfo.last_name,
                                        "Employee Email": employee_hours_worked[0]._id,
                                        "Position" : empInfo.position,
                                        "Grade" : empInfo.grade,
                                        "Days Worked": days_worked,
                                        "Hours Worked": hours_worked,
                                        "Tax (per hour)": tax_perhour_formatted,
                                        "Net Salary (per hour)": netsalary_perhour_formatted
                                    });
                                } else if(gross >= 2250000 && gross < 4250000) {
                                    let relief_allowance = 0.2;

                                    let statutory_relief = gross * relief_allowance + 200000;
                                    let statutory_relief_perhour = parseFloat((((statutory_relief / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();

                                    let gross_perhour = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();

                                    let taxable_income = gross - statutory_relief;
                                    let taxable_income_perhour = parseFloat((((taxable_income / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');

                                    let first_300 = 300000 * 0.07;
                                    let next_300 = 300000 * 0.11;
                                    let next_500 = 500000 * 0.15;
                                    let next_500_2 = 500000 * 0.19;
                                    let next_1600 = (taxable_income - 1600000) * 0.21;
                        
                                    let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600;
                                    let tax_perhour =  parseFloat((((tax / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();

                                    let netsalary = gross - tax;
                                    let netsalary_perhour = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                    res.status(200).json({
                                        "Staff ID" : empInfo.staff_ID,
                                        "First Name" : empInfo.first_name,
                                        "Last Name" : empInfo.last_name,
                                        "Employee Email": employee_hours_worked[0]._id,
                                        "Position" : empInfo.position,
                                        "Grade" : empInfo.grade,
                                        "Days Worked": days_worked,
                                        "Hours Worked": hours_worked,
                                        "Tax (per hour)": tax_perhour_formatted,
                                        "Net Salary (per hour)": netsalary_perhour_formatted
                                    });
                                } else if(gross >= 4250000) {
                                    let relief_allowance = 0.2;

                                    let statutory_relief = gross * relief_allowance + 200000;
                                    let statutory_relief_perhour = parseFloat((((statutory_relief / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                    
                                    let gross_perhour = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();

                                    let taxable_income = gross - statutory_relief;

                                    let taxable_income_perhour = parseFloat((((taxable_income / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');

                                    let first_300 = 300000 * 0.07;
                                    let next_300 = 300000 * 0.11;
                                    let next_500 = 500000 * 0.15;
                                    let next_500_2 = 500000 * 0.19;
                                    let next_1600 = 1600000 * 0.21;
                                    let next_3200 = (taxable_income - 3200000) * 0.24;
                        
                                    let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600 + next_3200;
                                    
                                    let tax_perhour =  parseFloat((((tax / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();

                                    let netsalary = gross - tax;
                                    let netsalary_perhour = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                    let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                    res.status(200).json({
                                        "Staff ID" : empInfo.staff_ID,
                                        "First Name" : empInfo.first_name,
                                        "Last Name" : empInfo.last_name,
                                        "Employee Email": employee_hours_worked[0]._id,
                                        "Position" : empInfo.position,
                                        "Grade" : empInfo.grade,
                                        "Days Worked": days_worked,
                                        "Hours Worked": hours_worked,
                                        "Tax (per hour)": tax_perhour_formatted,
                                        "Net Salary (per hour)": netsalary_perhour_formatted
                                    });
                                }
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