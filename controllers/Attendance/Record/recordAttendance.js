const Entry = require("../../../models/Attendance/entry");
const Exit = require("../../../models/Attendance/exit");
// const Payroll = require("../../../models/Payroll/payroll");
const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");
const WorkingHours = require("../../../models/Attendance/working_hours");
const DailyPay = require("../../../models/Daily_Pay/daily_pay");
const Enrollment = require("../../../models/Enrollment/enrollment");

const recordAttendance = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.staff_ID) {
        emptyFields.push("staff_ID");
    } if(!req.body.first_name) {
        emptyFields.push("first_name");
    } if(!req.body.last_name) {
        emptyFields.push("last_name");
    } if(!req.body.email) {
        emptyFields.push("email");
    } if(!req.body.date) {
        emptyFields.push("date");
    } if(!req.body.time) {
        emptyFields.push("time");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate fields", emptyFields})
    } else {
        let checkin_date = '';
        let checkin_time = '';
        let checkout_date = '';
        let checkout_time = '';
        
        try {
            Enrollment.findOne({staff_ID: req.body.staff_ID}, (error, rs) => {
                if(error) throw error;
                else {
                    if(rs) {
                        Enrollment.find({email: req.body.email, staff_ID: req.body.staff_ID}, (error, employee) => {
                            if(error) throw error;
                            else {
                                if(employee.length > 0) {
                                    let Staff_ID = employee[0].staff_ID;
                                    let Employee_ID = employee[0]._id;
                                    let Employee_First_Name = employee[0].first_name;
                                    let Employee_Last_Name = employee[0].last_name;
                                    let Employee_Email = employee[0].email;
                                    let Employee_Gross = employee[0].gross_salary;
                                    let Employee_Position = employee[0].position;
                                    let Employee_Grade = employee[0].grade
                                    let Employee_Type = employee[0].employee_type;
                                    Enrollment.find({email: Employee_Email, status: "Active"}, (error, rs) => {
                                        if(error) throw error;
                                        else {
                                            if(rs.length > 0) {
                                                const newEntry = new Entry({staff_ID: Staff_ID, first_name: Employee_First_Name,
                                                    last_name: Employee_Last_Name, email: Employee_Email, date: req.body.date,
                                                    in_time: req.body.time});
                                            
                                                const newExit = new Exit({staff_ID: Staff_ID, first_name: Employee_First_Name,
                                                    last_name: Employee_Last_Name, email: Employee_Email, date: req.body.date,
                                                    out_time: req.body.time});
                                            
                                                const newHistoryEntry = new AttendanceHistory({staff_ID: Staff_ID, first_name: Employee_First_Name,
                                                    last_name: Employee_Last_Name, email: Employee_Email, date: req.body.date,
                                                    in_time: req.body.time});
                                            
                                                const newHistoryExit = new AttendanceHistory({staff_ID: Staff_ID, first_name: Employee_First_Name,
                                                    last_name: Employee_Last_Name, email: Employee_Email, date: req.body.date,
                                                    out_time: req.body.time});
                                                Entry.find({email: Employee_Email}, async (error, result) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(result.length > 0) {
                                                            let in_date = result[0].date;
                                                            let in_time = result[0].in_time;
                                                            let in_datetime = new Date(in_date+" "+in_time);
                                                            let real_time = new Date();
                                                            let diff_msec = real_time.getTime() - in_datetime.getTime()
                                                            let diff_hours = Math.floor(diff_msec / 1000 / 60 / 60);

                                                            if(diff_hours < 3) {
                                                                res.status(400).json({"Message": "Working hours should exceed 2"})
                                                            }  else { 
                                                                Entry.findOneAndDelete({email : Employee_Email}, async (error, result) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(result) {
                                                                            try {
                                                                                await newExit.save();
                                                                                // console.log("Added to exit")
                                                                                try {
                                                                                    await newHistoryExit.save();
                                                                                    //  getting check-out date and time
                                                                                    try {
                                                                                        Exit.find({email: Employee_Email}, {_id: 1, email: 1, date: 1, out_time: 1}, (error, out_date_time) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                checkout_date = out_date_time[0].date;
                                                                                                checkout_time = out_date_time[0].out_time;
                                                                                                // console.log(Employee_Email+' checkout date '+checkout_date+' '+checkout_time);
                                                                                                // getting check-in date and time
                                                                                                try {
                                                                                                    AttendanceHistory.find({email: Employee_Email, out_time: "Still In"},{_id: 1, email: 1, date: 1, in_time: 1}, async (error, in_date_time) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            checkin_date = in_date_time[0].date;
                                                                                                            checkin_time = in_date_time[0].in_time;
                                                                                                            // console.log(Employee_Email+' checkin date '+checkin_date+' '+checkin_time);
                                    
                                                                                                            // calculating hours
                                                                                                            let checkout = new Date(checkout_date+' '+checkout_time);
                                                                                                            // console.log(checkout);
                                                                                                            let checkin = new Date(checkin_date+' '+checkin_time);
                                                                                                            // console.log(checkin);
                                    
                                                                                                            // getting time difference
                                                                                                            let timediff = checkout.getTime() - checkin.getTime();
                                                                                                            // console.log(`Time difference in milliseconds = ${timediff}`);
                                    
                                                                                                            // converting to hours, minutes and seconds
                                                                                                            let msec = timediff;
                                                                                                            let hh = Math.floor(msec / 1000 / 60 / 60);
                                                                                                            msec -= hh * 1000 * 60 * 60;
                                                                                                            let mm = Math.floor(msec / 1000 / 60);
                                                                                                            msec -= mm * 1000 * 60;
                                                                                                            let ss = Math.floor(msec / 1000);
                                                                                                            msec -= ss * 1000;
                                                                                                            // console.log(`${Employee_Email} worked for ${hh} hours, ${mm} minutes and ${ss} seconds`);
                                    
                                                                                                            // saving to working hours collection
                                                                                                            let Hours = hh; 
                                                                                                            let Minutes = mm;
                                                                                                            let Seconds = ss;
                                    
                                                                                                            let Extra_hours = Hours - 8;
                                    
                                                                                                            const newWorking_extra_hours = new WorkingHours({staff_ID: Staff_ID, 
                                                                                                                first_name: Employee_First_Name, last_name: Employee_Last_Name, email: Employee_Email, 
                                                                                                                date: req.body.date, hours: {
                                                                                                                    worked_hours: 8,
                                                                                                                    extra_hours: Extra_hours
                                                                                                                }, minutes: Minutes, seconds: Seconds
                                                                                                            });
                                                                                                            const newWorking_normal_hours = new WorkingHours({staff_ID: Staff_ID, 
                                                                                                                first_name: Employee_First_Name, last_name: Employee_Last_Name, email: Employee_Email, 
                                                                                                                date: req.body.date, hours: {
                                                                                                                    worked_hours: Hours
                                                                                                                }, minutes: Minutes, seconds: Seconds
                                                                                                            });
    
                                                                                                            if(Employee_Type === "Full-Time") {
                                                                                                                if(Hours > 8) {
                                                                                                                    await newWorking_extra_hours.save();
                                                                                                                    try {
                                                                                                                        WorkingHours.aggregate([
                                                                                                                            {
                                                                                                                                // checking if emails match
                                                                                                                                $match: {
                                                                                                                                    email: Employee_Email,
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
                                                                                                                            ], async (error, employee_worked_hours) => {
                                                                                                                            if(error) throw error;
                                                                                                                            else {
                                                                                                                                if(employee_worked_hours.length > 0) {
                                                                                                                                    let total_hours_worked = employee_worked_hours[0].total_hours;
                                                                                                                                    let total_worked_days = employee_worked_hours[0].days_worked;
                                                                                                                                    let ideal_total_working_hours = 40 * 52; // 40 = ideal working hours in a week 8 x 5 // 52 = number of weeks in a year
                                                                                                                                    if(Employee_Gross < 30000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                    
                                                                                                                                        let hourly_rate = parseFloat((((Employee_Gross / ideal_total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let hourly_rate_formatted = (hourly_rate).toLocaleString();
                                    
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        let overtime_pay = parseFloat((((hourly_rate * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();
                                    
                                                                                                                                        let total_netsalary = parseFloat((((netsalary_perdays_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}\nEmail = ${Employee_Email} hourly rate = ${hourly_rate_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} extra hours worked = ${Extra_hours}\nEmail = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} overtime pay = ${overtime_pay_formatted}\nEmail = ${Employee_Email} netsalary per total days worked + overtime pay = ${total_netsalary_formatted}\n`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                                            netsalary: total_netsalary
                                                                                                                                        }});
                                                                                            
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 30000 && Employee_Gross < 625000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = taxable_income - 0;
                                                                                                                            
                                                                                                                                        let tax = first_300 * 0.07;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        let hourly_rate = parseFloat((((Employee_Gross / ideal_total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let hourly_rate_formatted = (hourly_rate).toLocaleString();
                                    
                                                                                                                                        let overtime_pay = parseFloat((((hourly_rate * 2.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();
                                    
                                                                                                                                        let total_netsalary = parseFloat((((netsalary_perdays_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}\nEmail = ${Employee_Email} hourly rate = ${hourly_rate_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} extra hours worked = ${Extra_hours}\nEmail = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} overtime pay = ${overtime_pay_formatted}\nEmail = ${Employee_Email} netsalary per total days worked + overtime pay = ${total_netsalary_formatted}\n`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                                            netsalary: total_netsalary
                                                                                                                                        }});
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                    
                                                                                                                                    } else if(Employee_Gross >= 625000 && Employee_Gross < 1000000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = (taxable_income - 300000) * 0.11;
                                    
                                                                                                                                        let tax = first_300 + next_300;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        let hourly_rate = parseFloat((((Employee_Gross / ideal_total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let hourly_rate_formatted = (hourly_rate).toLocaleString();
                                    
                                                                                                                                        let overtime_pay = parseFloat((((hourly_rate * 3.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();
                                    
                                                                                                                                        let total_netsalary = parseFloat((((netsalary_perdays_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}\nEmail = ${Employee_Email} hourly rate = ${hourly_rate_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} extra hours worked = ${Extra_hours}\nEmail = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} overtime pay = ${overtime_pay_formatted}\nEmail = ${Employee_Email} netsalary per total days worked + overtime pay = ${total_netsalary_formatted}\n`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                                            netsalary: total_netsalary
                                                                                                                                        }});
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 1000000 && Employee_Gross < 2250000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = 300000 * 0.11;
                                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                                        let next_500_2 = (taxable_income - 1100000) * 0.19;
                                    
                                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        let hourly_rate = parseFloat((((Employee_Gross / ideal_total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let hourly_rate_formatted = (hourly_rate).toLocaleString();
                                    
                                                                                                                                        let overtime_pay = parseFloat((((hourly_rate * 4.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();
                                    
                                                                                                                                        let total_netsalary = parseFloat((((netsalary_perdays_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}\nEmail = ${Employee_Email} hourly rate = ${hourly_rate_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} extra hours worked = ${Extra_hours}\nEmail = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} overtime pay = ${overtime_pay_formatted}\nEmail = ${Employee_Email} netsalary per total days worked + overtime pay = ${total_netsalary_formatted}\n`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                                            netsalary: total_netsalary
                                                                                                                                        }});
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 2250000 && Employee_Gross < 4250000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = 300000 * 0.11;
                                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                                        let next_500_2 = 500000 * 0.19;
                                                                                                                                        let next_1600 = (taxable_income - 1600000) * 0.21;
                                                                                                                            
                                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        let hourly_rate = parseFloat((((Employee_Gross / ideal_total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let hourly_rate_formatted = (hourly_rate).toLocaleString();
                                    
                                                                                                                                        let overtime_pay = parseFloat((((hourly_rate * 5.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();
                                    
                                                                                                                                        let total_netsalary = parseFloat((((netsalary_perdays_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}\nEmail = ${Employee_Email} hourly rate = ${hourly_rate_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} extra hours worked = ${Extra_hours}\nEmail = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} overtime pay = ${overtime_pay_formatted}\nEmail = ${Employee_Email} netsalary per total days worked + overtime pay = ${total_netsalary_formatted}\n`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                                            netsalary: total_netsalary
                                                                                                                                        }});
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 4250000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = 300000 * 0.11;
                                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                                        let next_500_2 = 500000 * 0.19;
                                                                                                                                        let next_1600 = 1600000 * 0.21;
                                                                                                                                        let next_3200 = (taxable_income - 3200000) * 0.24;
                                                                                                                            
                                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600 + next_3200;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        let hourly_rate = parseFloat((((Employee_Gross / ideal_total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let hourly_rate_formatted = (hourly_rate).toLocaleString();
                                    
                                                                                                                                        let overtime_pay = parseFloat((((hourly_rate * 5.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();
                                    
                                                                                                                                        let total_netsalary = parseFloat((((netsalary_perdays_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}\nEmail = ${Employee_Email} hourly rate = ${hourly_rate_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} extra hours worked = ${Extra_hours}\nEmail = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} overtime pay = ${overtime_pay_formatted}\nEmail = ${Employee_Email} netsalary per total days worked + overtime pay = ${total_netsalary_formatted}\n`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                                            netsalary: total_netsalary
                                                                                                                                        }});
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        });
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }
                                    
                                                                                                                } else /* does not work for more than 8 hours */ {
                                                                                                                    await newWorking_normal_hours.save();
                                                                                                                    try {
                                                                                                                        WorkingHours.aggregate([
                                                                                                                            {
                                                                                                                                // checking if emails match
                                                                                                                                $match: {
                                                                                                                                    email: Employee_Email,
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
                                                                                                                            ], async (error, employee_worked_hours) => {
                                                                                                                            if(error) throw error;
                                                                                                                            else {
                                                                                                                                if(employee_worked_hours.length > 0) {
                                                                                                                                    let total_hours_worked = employee_worked_hours[0].total_hours;
                                                                                                                                    let total_worked_days = employee_worked_hours[0].days_worked;
                                                                                                                                    if(Employee_Gross < 30000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                    
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                            employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                            last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                            grade: Employee_Grade, gross_salary: Employee_Gross, hours_worked: {worked_hours: Hours}, 
                                                                                                                                            date: checkout_date, 
                                                                                                                                            net_salary:{
                                                                                                                                                days_worked: total_worked_days,
                                                                                                                                                netsalary: netsalary_perdays_worked
                                                                                                                                            }
                                                                                                                                        });
                                                                                            
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 30000 && Employee_Gross < 625000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = taxable_income - 0;
                                                                                                                            
                                                                                                                                        let tax = first_300 * 0.07;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                            employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                            last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                            grade: Employee_Grade, gross_salary: Employee_Gross, hours_worked: {worked_hours: Hours}, 
                                                                                                                                            date: checkout_date, 
                                                                                                                                            net_salary:{
                                                                                                                                                days_worked: total_worked_days,
                                                                                                                                                netsalary: netsalary_perdays_worked
                                                                                                                                            }
                                                                                                                                        });
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                    
                                                                                                                                    } else if(Employee_Gross >= 625000 && Employee_Gross < 1000000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = (taxable_income - 300000) * 0.11;
                                    
                                                                                                                                        let tax = first_300 + next_300;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                            employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                            last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                            grade: Employee_Grade, gross_salary: Employee_Gross, hours_worked: {worked_hours: Hours}, 
                                                                                                                                            date: checkout_date, 
                                                                                                                                            net_salary:{
                                                                                                                                                days_worked: total_worked_days,
                                                                                                                                                netsalary: netsalary_perdays_worked
                                                                                                                                            }
                                                                                                                                        });
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 1000000 && Employee_Gross < 2250000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = 300000 * 0.11;
                                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                                        let next_500_2 = (taxable_income - 1100000) * 0.19;
                                    
                                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                            employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                            last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                            grade: Employee_Grade, gross_salary: Employee_Gross, hours_worked: {worked_hours: Hours}, 
                                                                                                                                            date: checkout_date, 
                                                                                                                                            net_salary:{
                                                                                                                                                days_worked: total_worked_days,
                                                                                                                                                netsalary: netsalary_perdays_worked
                                                                                                                                            }
                                                                                                                                        });
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 2250000 && Employee_Gross < 4250000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = 300000 * 0.11;
                                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                                        let next_500_2 = 500000 * 0.19;
                                                                                                                                        let next_1600 = (taxable_income - 1600000) * 0.21;
                                                                                                                            
                                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                            employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                            last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                            grade: Employee_Grade, gross_salary: Employee_Gross, hours_worked: {worked_hours: Hours}, 
                                                                                                                                            date: checkout_date, 
                                                                                                                                            net_salary:{
                                                                                                                                                days_worked: total_worked_days,
                                                                                                                                                netsalary: netsalary_perdays_worked
                                                                                                                                            }
                                                                                                                                        });
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                    
                                                                                                                                    } else if(Employee_Gross >= 4250000) {
                                                                                                                                        let number_of_days_worked = total_worked_days / 252;
                                                                                                                                        let relief_allowance = 0.2;
                                                                                                                                        
                                                                                                                                        let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                        let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                                    
                                                                                                                                        let gross_perday = parseFloat(((((Employee_Gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                                        let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                                    
                                                                                                                                        let taxable_income = Employee_Gross - statutory_relief
                                                                                                                                        let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                                            
                                                                                                                                        let first_300 = 300000 * 0.07;
                                                                                                                                        let next_300 = 300000 * 0.11;
                                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                                        let next_500_2 = 500000 * 0.19;
                                                                                                                                        let next_1600 = 1600000 * 0.21;
                                                                                                                                        let next_3200 = (taxable_income - 3200000) * 0.24;
                                                                                                                            
                                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600 + next_3200;
                                                                                                                                        let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let tax_perday_formatted  = (tax_perday).toLocaleString();
                                    
                                                                                                                                        let netsalary = Employee_Gross - tax;
                                                                                                                                        let netsalary_perdays_worked = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                        let netsalary_perdays_worked_formatted = (netsalary_perdays_worked).toLocaleString();
                                    
                                                                                                                                        // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                        // console.log(`Email = ${Employee_Email} netsalary per total days worked = ${netsalary_perdays_worked_formatted}`);
                                    
                                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                            employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                            last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                            grade: Employee_Grade, gross_salary: Employee_Gross, hours_worked: {worked_hours: Hours}, 
                                                                                                                                            date: checkout_date, 
                                                                                                                                            net_salary:{
                                                                                                                                                days_worked: total_worked_days,
                                                                                                                                                netsalary: netsalary_perdays_worked
                                                                                                                                            }
                                                                                                                                        });
                                    
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        });
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }
                                                                                                                }
                                    
                                                                                                            } else if(Employee_Type !== "Full-Time") {
                                                                                                                if(Hours > 8) {
                                                                                                                    await newWorking_extra_hours.save();
                                                                                                                } else if(Hours <= 8) {
                                                                                                                    await newWorking_normal_hours.save();
                                                                                                                }
                                                                                                                try {
                                                                                                                    WorkingHours.aggregate([
                                                                                                                        {
                                                                                                                            // checking if emails match
                                                                                                                            $match: {
                                                                                                                                email: Employee_Email,
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
                                                                                                                        ], async (error, employee_worked_hours) => {
                                                                                                                        if(error) throw error;
                                                                                                                        else {
                                                                                                                            if(employee_worked_hours.length > 0) {
                                                                                                                                let total_hours_worked = employee_worked_hours[0].total_hours;
                                                                                                                                let total_worked_days = employee_worked_hours[0].days_worked;
                                                                                                                                let ideal_total_working_hours = 40 * 52; // 40 = ideal working hours in a week 8 x 5 // 52 = number of weeks in a year
                                                                                                                                
                                                                                                                                if(Employee_Gross < 30000) {
                                                                                                                                    let netsalary_perhours_worked = parseFloat((((Employee_Gross / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                                                                                                                    // .toFixed(2); two decimal points;
                                    
                                                                                                                                    // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);
                                    
                                                                                                                                    // over normal working hours
                                                                                                                                    const newDailyPay_over = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                    // within working hours
                                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked:{worked_hours: Hours}, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                    
                                                                                                                                    if(Hours > 8){
                                                                                                                                        try {
                                                                                                                                            await newDailyPay_over.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    } else if(Hours <= 8) {
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                    
                                                                                                                                } else if(Employee_Gross >= 30000 && Employee_Gross < 625000) {
                                                                                                                                    let relief_allowance = 0.2;
                                                
                                                                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                    let statutory_relief_perhour = parseFloat((((statutory_relief / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                                                                                                                    
                                                                                                                                    let gross_perhour = parseFloat((((Employee_Gross / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();
                                    
                                                                                                                                    let taxable_income = Employee_Gross - statutory_relief;
                                                                                                                                    let taxable_income_perhour = parseFloat((((taxable_income / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');
                                    
                                                                                                                                    let first_300 = taxable_income - 0;
                                    
                                                                                                                                    let tax = first_300 * 0.07;
                                                                                                                                    let tax_perhour =  parseFloat((((tax / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();
                                    
                                                                                                                                    let netsalary = Employee_Gross - tax;
                                                                                                                                    let netsalary_perhours_worked = parseFloat((((netsalary / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                    
                                                                                                                                    // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);
                                    
                                                                                                                                    // over normal working hours
                                                                                                                                    const newDailyPay_over = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                    // within working hours
                                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked:{worked_hours: Hours}, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                    
                                                                                                                                    if(Hours > 8){
                                                                                                                                        try {
                                                                                                                                            await newDailyPay_over.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    } else if(Hours <= 8) {
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                    
                                                                                                                                } else if(Employee_Gross >= 625000 && Employee_Gross < 1000000) {
                                                                                                                                    let relief_allowance = 0.2;
                                                
                                                                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                    let statutory_relief_perhour = parseFloat((((statutory_relief / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                                                                                                                    
                                                                                                                                    let gross_perhour = parseFloat((((Employee_Gross / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();
                                    
                                                                                                                                    let taxable_income = Employee_Gross - statutory_relief;
                                                                                                                                    let taxable_income_perhour = parseFloat((((taxable_income / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');
                                    
                                                                                                                                    let first_300 = 300000 * 0.07;
                                                                                                                                    let next_300 = (taxable_income - 300000) * 0.11;
                                    
                                                                                                                                    let tax = first_300 + next_300;
                                                                                                                                    let tax_perhour =  parseFloat((((tax / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();
                                    
                                                                                                                                    let netsalary = Employee_Gross - tax;
                                                                                                                                    let netsalary_perhours_worked = parseFloat((((netsalary / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                    
                                                                                                                                    // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);
                                    
                                                                                                                                    // over normal working hours
                                                                                                                                    const newDailyPay_over = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                    // within working hours
                                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked:{worked_hours: Hours}, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                    
                                                                                                                                    if(Hours > 8){
                                                                                                                                        try {
                                                                                                                                            await newDailyPay_over.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    } else if(Hours <= 8) {
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    
                                                                                                                                } else if(Employee_Gross >= 1000000 && Employee_Gross < 2250000) {
                                                                                                                                    let relief_allowance = 0.2;
                                                
                                                                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                    let statutory_relief_perhour = parseFloat((((statutory_relief / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                                                                                                                    
                                                                                                                                    let gross_perhour = parseFloat((((Employee_Gross / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();
                                    
                                                                                                                                    let taxable_income = Employee_Gross - statutory_relief;
                                                                                                                                    let taxable_income_perhour = parseFloat((((taxable_income / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');
                                    
                                                                                                                                    let first_300 = 300000 * 0.07;
                                                                                                                                    let next_300 = 300000 * 0.11;
                                                                                                                                    let next_500 = 500000 * 0.15;
                                                                                                                                    let next_500_2 = (taxable_income - 1100000) * 0.19;
                                    
                                                                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2;
                                                                                                                                    let tax_perhour =  parseFloat((((tax / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();
                                    
                                                                                                                                    let netsalary = Employee_Gross - tax;
                                                                                                                                    let netsalary_perhours_worked = parseFloat((((netsalary / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                    
                                                                                                                                    // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);
                                    
                                                                                                                                    // over normal working hours
                                                                                                                                    const newDailyPay_over = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                    // within working hours
                                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked:{worked_hours: Hours}, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                    
                                                                                                                                    if(Hours > 8){
                                                                                                                                        try {
                                                                                                                                            await newDailyPay_over.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    } else if(Hours <= 8) {
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                    
                                                                                                                                } else if(Employee_Gross >= 2250000 && Employee_Gross < 4250000) {
                                                                                                                                    let relief_allowance = 0.2;
                                                
                                                                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                    let statutory_relief_perhour = parseFloat((((statutory_relief / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                                                                                                                    
                                                                                                                                    let gross_perhour = parseFloat((((Employee_Gross / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();
                                    
                                                                                                                                    let taxable_income = Employee_Gross - statutory_relief;
                                                                                                                                    let taxable_income_perhour = parseFloat((((taxable_income / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');
                                    
                                                                                                                                    let first_300 = 300000 * 0.07;
                                                                                                                                    let next_300 = 300000 * 0.11;
                                                                                                                                    let next_500 = 500000 * 0.15;
                                                                                                                                    let next_500_2 = 500000 * 0.19;
                                                                                                                                    let next_1600 = (taxable_income - 1600000) * 0.21;
                                                                                                                                    
                                                                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600;
                                                                                                                                    let tax_perhour =  parseFloat((((tax / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();
                                    
                                                                                                                                    let netsalary = Employee_Gross - tax;
                                                                                                                                    let netsalary_perhours_worked = parseFloat((((netsalary / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                    
                                                                                                                                    // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);
                                    
                                                                                                                                    // over normal working hours
                                                                                                                                    const newDailyPay_over = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                    // within working hours
                                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked:{worked_hours: Hours}, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                    
                                                                                                                                    if(Hours > 8){
                                                                                                                                        try {
                                                                                                                                            await newDailyPay_over.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    } else if(Hours <= 8) {
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                    
                                                                                                                                } else if(Employee_Gross >= 4250000) {
                                                                                                                                    let relief_allowance = 0.2;
                                                
                                                                                                                                    let statutory_relief = Employee_Gross * relief_allowance + 200000;
                                                                                                                                    let statutory_relief_perhour = parseFloat((((statutory_relief / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let statutory_relief_perhour_formatted = (statutory_relief_perhour).toLocaleString();
                                                                                                                                    
                                                                                                                                    let gross_perhour = parseFloat((((Employee_Gross / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let gross_perhour_formatted = (gross_perhour).toLocaleString();
                                    
                                                                                                                                    let taxable_income = Employee_Gross - statutory_relief;
                                                                                                                                    let taxable_income_perhour = parseFloat((((taxable_income / ideal_total_working_hours * total_hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let taxable_income_perhour_formatted = ((taxable_income_perhour).toLocaleString()).replace(/,/g,'');
                                    
                                                                                                                                    let first_300 = 300000 * 0.07;
                                                                                                                                    let next_300 = 300000 * 0.11;
                                                                                                                                    let next_500 = 500000 * 0.15;
                                                                                                                                    let next_500_2 = 500000 * 0.19;
                                                                                                                                    let next_1600 = 1600000 * 0.21;
                                                                                                                                    let next_3200 = (taxable_income - 3200000) * 0.24;
                                                                                                                        
                                                                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2 + next_1600 + next_3200;
                                                                                                                                    let tax_perhour =  parseFloat((((tax / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let tax_perhour_formatted = (tax_perhour).toLocaleString();
                                    
                                                                                                                                    let netsalary = Employee_Gross - tax;
                                                                                                                                    let netsalary_perhours_worked = parseFloat((((netsalary / ideal_total_working_hours * total_hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                                    let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                    
                                                                                                                                    // console.log(`Email = ${Employee_Email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} hours worked = ${Hours} (today)\nEmail = ${Employee_Email} total working hours of = ${total_hours_worked}\nEmail = ${Employee_Email} days worked = ${total_worked_days}`);
                                                                                                                                    // console.log(`Email = ${Employee_Email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);
                                    
                                                                                                                                    // over normal working hours
                                                                                                                                    const newDailyPay_over = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked: {
                                                                                                                                            worked_hours: 8,
                                                                                                                                            overtime: "Worked Overtime",
                                                                                                                                            extra_hours: Extra_hours
                                                                                                                                        }, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                    // within working hours
                                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                                        last_name: Employee_Last_Name, email: Employee_Email, position: Employee_Position,
                                                                                                                                        grade: Employee_Grade, gross_salary: Employee_Gross,
                                                                                                                                        hours_worked:{worked_hours: Hours}, date: checkout_date, 
                                                                                                                                        net_salary:{
                                                                                                                                            days_worked: total_worked_days,
                                                                                                                                            netsalary: netsalary_perhours_worked
                                                                                                                                        }
                                                                                                                                    });
                                    
                                                                                                                                    if(Hours > 8){
                                                                                                                                        try {
                                                                                                                                            await newDailyPay_over.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    } else if(Hours <= 8) {
                                                                                                                                        try {
                                                                                                                                            await newDailyPay.save();
                                                                                                                                        } catch (error) {
                                                                                                                                            next(error);
                                                                                                                                        }
                                                                                                                                    }
                                    
                                                                                                                                }                            
                                                                                                                            }
                                                                                                                        }
                                                                                                                    });
                                                                                                                } catch (error) {
                                                                                                                    next(error);
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }).sort({date: -1, in_time: -1, email: -1});
                                                                                                    // Attendance history end
                                                                                                } catch (error) {
                                                                                                    next(error);
                                                                                                }
                                                                                            }
                                                                                        }).sort({date: -1, out_time: -1, email: -1});
                                                                                        // Exit end
                                                                                    } catch (error) {
                                                                                        next(error);
                                                                                    }
                                                                                    // console.log("Added to history")
                                                                                } catch (error) {
                                                                                    next(error);
                                                                                }
                                                                            } catch (error) {
                                                                                next(error);
                                                                            }
                                                                            res.status(200).json({"Message" : "Checked Out"});
                                                                        }
                                                                        // console.log("Entry deleted");
                                                                    } 
                                                                });
                                                            }
                                                            // Entry with delete end
                                                        } else {       
                                                            try {
                                                                Exit.find({email: Employee_Email}, async (error, result) => { 
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(result.length > 0) {
                                                                            var day = new Date();
                                                                            var time = day.getTime()
                                                                            var timeOffSet = day.getTimezoneOffset()
                                                                            var current_day = new Date(time - timeOffSet*60*1000).toISOString().substr(0,10).replace('T', ' ');
                                                                            AttendanceHistory.find({email: Employee_Email, date: current_day, out_time: "Still In"}, (error, result) => {
                                                                                if(error) throw error;
                                                                                else {
                                                                                    if(result.length > 0) {
                                                                                        res.status(400).json({"Message": "Already checked in today"})
                                                                                    } else {
                                                                                        Exit.findOneAndDelete({email: Employee_Email}, async (error, result) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                if(result) {
                                                                                                    // console.log("Exit deleted");            
                                                                                                    await newEntry.save();
                                                                                                    // console.log("Added to entry");
                                                                                                    await newHistoryEntry.save();
                                                                                                    // console.log("Added to history");
                                                                                                    res.status(200).json({"Message" : "Checked In"});
                                                                                                }
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                }
                                                                            })
                                                                        } else if(result.length === 0) {
                                                                            await newEntry.save();
                                                                            // console.log("Added to entry");
                                                                            try {
                                                                                await newHistoryEntry.save();
                                                                                res.status(200).json({"Message" : "Checked In"});
                                                                                // console.log("Added to history");
                                                                            } catch (error) {
                                                                                next(error);
                                                                            }
                                                                        }
                                                                    }
                                                                })
                                                            } catch (error) {
                                                                next(error);
                                                            }
                                                        }
                                                    }
                                                });
                                                // Entry end
                                            } else {
                                                res.status(404).json({"Message": "Employee has been terminated"});
                                            }
                                        }
                                    })
                                }
                                else{
                                    res.status(400).json({"Message": "Invalid employee email or staff ID"});
                                }
                            }
                        });
                        // Enrollment end
                    } else {
                        res.status(404).json({"Message": "Employee not found"});
                    }
                }
            })
        } catch (error) {
            next(error);
        }
    }
    
}

module.exports = recordAttendance;