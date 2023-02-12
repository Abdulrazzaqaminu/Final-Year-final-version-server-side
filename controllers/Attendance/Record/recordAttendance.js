const Entry = require("../../../models/Attendance/entry");
const Exit = require("../../../models/Attendance/exit");
const Payroll = require("../../../models/Payroll/payroll");
const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");
const WorkingHours = require("../../../models/Attendance/working_hours");
const DailyPay = require("../../../models/Daily_Pay/daily_pay");
const Enrollment = require("../../../models/Enrollment/enrollment");

const recordAttendance = async (req, res, next) => {
    const newEntry = new Entry({staff_ID: req.body.staff_ID, first_name: req.body.first_name,
        last_name: req.body.last_name, email: req.body.email, date: req.body.date,
        in_time: req.body.time});

    const newExit = new Exit({staff_ID: req.body.staff_ID, first_name: req.body.first_name,
        last_name: req.body.last_name, email: req.body.email, date: req.body.date,
        out_time: req.body.time});

    const newHistoryEntry = new AttendanceHistory({staff_ID: req.body.staff_ID, first_name: req.body.first_name,
        last_name: req.body.last_name, email: req.body.email, date: req.body.date,
        in_time: req.body.time});

    const newHistoryExit = new AttendanceHistory({staff_ID: req.body.staff_ID, first_name: req.body.first_name,
        last_name: req.body.last_name, email: req.body.email, date: req.body.date,
        out_time: req.body.time});

    let checkin_date = '';
    let checkin_time = '';
    let checkout_date = '';
    let checkout_time = '';
    
    try {
        Enrollment.find({email: req.body.email, staff_ID: req.body.staff_ID}, (error, employee) => {
            if(error) throw error;
            else {
                if(employee.length > 0) {
                    let Employee_ID = employee[0]._id;
                    let Employee_Position = employee[0].position;
                    let Employee_Grade = employee[0].grade
                    let Employee_Type = employee[0].employee_type;
                    Entry.find({email: req.body.email}, async (error, result) => {
                        if(error) throw error;
                        else {
                            if(result.length > 0) {
                                Entry.findOneAndDelete({email : req.body.email}, async (error, result) => {
                                    if(error) throw error;
                                    else {
                                        // console.log("Entry deleted");
                                        try {
                                            await newExit.save();
                                            // console.log("Added to exit")
                                            try {
                                                await newHistoryExit.save();
                                                //  getting check-out date and time
                                                try {
                                                    Exit.find({email: req.body.email}, {_id: 1, email: 1, date: 1, out_time: 1}, (error, out_date_time) => {
                                                        if(error) throw error;
                                                        else {
                                                            checkout_date = out_date_time[0].date;
                                                            checkout_time = out_date_time[0].out_time;
                                                            // console.log(req.body.email+' checkout date '+checkout_date+' '+checkout_time);
                                                            // getting check-in date and time
                                                            try {
                                                                AttendanceHistory.find({email: req.body.email, out_time: "Still In"},{_id: 1, email: 1, date: 1, in_time: 1}, async (error, in_date_time) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        checkin_date = in_date_time[0].date;
                                                                        checkin_time = in_date_time[0].in_time;
                                                                        // console.log(req.body.email+' checkin date '+checkin_date+' '+checkin_time);

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
                                                                        // console.log(`${req.body.email} worked for ${hh} hours, ${mm} minutes and ${ss} seconds`);

                                                                        // saving to working hours collection
                                                                        let Hours = hh; 
                                                                        let Minutes = mm;
                                                                        let Seconds = ss;
                                                                        const newWorking_hours = new WorkingHours({staff_ID: req.body.staff_ID, 
                                                                        first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, 
                                                                        date: req.body.date, hours: Hours, minutes: Minutes, seconds: Seconds});
                                                                        try {
                                                                            await newWorking_hours.save();
                                                                            Payroll.find({employee_id: Employee_ID}, (error, employee) =>{
                                                                                if(error) throw error;
                                                                                else{
                                                                                    if(employee.length > 0) {
                                                                                        let empInfo = employee[0];
                                                                                        let gross = employee[0].annual_gross;
                                                                                        let Staff_ID = employee[0].staff_ID;
                                                                                        let Employee_First_Name = employee[0].first_name;
                                                                                        let Employee_Last_Name = employee[0].last_name;
                                                                                        let email = employee[0].email;
                                                                                        // console.log(email+" "+gross);
                                                                                        // console.log(empInfo);
                                                                                        WorkingHours.aggregate([
                                                                                            {
                                                                                                // checking if emails match
                                                                                                $match: {
                                                                                                    email: req.body.email,
                                                                                               }
                                                                                            },
                                                                                            {
                                                                                                // suming up employees hours worked
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
                                                                                                    let total_working_hours = 40 * 52; // 40 = ideal working hours in a week 8 x 5 // 52 = number of weeks in a year
                                                                                                    WorkingHours.findOne({email: req.body.email}, async (error, hours) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            let hour_perday = hours.hours;
                                                                                                            // console.log("hours worked = "+hour_perday);
                                                                                                            // checking employee type to know how to calculate salary
                                                                                                            if(Employee_Type === "Full-Time"){
                                                                                                                if(gross < 30000) {
                                                                                                                    let number_of_days_worked = days_worked / 252;

                                                                                                                    let netsalary_perday = parseFloat((((gross * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let netsalary_perday_formatted = (netsalary_perday).toLocaleString();

                                                                                                                    console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                    console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                    console.log(`Email = ${email} netsalary per days worked = ${netsalary_perday_formatted}\n`);

                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                    employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                    last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                    grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                    date: checkout_date, 
                                                                                                                    net_salary:{
                                                                                                                        days_worked: days_worked,
                                                                                                                        total_netsalary: netsalary_perday
                                                                                                                    }});
                                                                        
                                                                                                                    try {
                                                                                                                        await newDailyPay.save();
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }

                                                                                                                } else if(gross >= 30000 && gross < 625000) {
                                                                                                                    let number_of_days_worked = days_worked / 252;
                                                                                                                    let relief_allowance = 0.2;
                                                                                                                    
                                                                                                                    let statutory_relief = gross * relief_allowance + 200000;
                                                                                                                    let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                
                                                                                                                    let gross_perday = parseFloat(((((gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                    let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                
                                                                                                                    let taxable_income = gross - statutory_relief
                                                                                                                    let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();
                                                                                                        
                                                                                                                    let first_300 = taxable_income - 0;
                                                                                                        
                                                                                                                    let tax = first_300 * 0.07;
                                                                                                                    let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let tax_perday_formatted  = (tax_perday).toLocaleString();
                                                                
                                                                                                                    let netsalary = gross - tax;
                                                                                                                    let netsalary_perday = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let netsalary_perday_formatted = (netsalary_perday).toLocaleString();

                                                                                                                    console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                    console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                    console.log(`Email = ${email} netsalary per days worked = ${netsalary_perday_formatted}\n`);
                                                            
                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                    employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                    last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                    grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                    date: checkout_date, 
                                                                                                                    net_salary:{
                                                                                                                        days_worked: days_worked,
                                                                                                                        total_netsalary: netsalary_perday
                                                                                                                    }});
                                                                        
                                                                                                                    try {
                                                                                                                        await newDailyPay.save();
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }

                                                                                                                } else if(gross >= 625000 && gross < 1000000) {
                                                                                                                    let number_of_days_worked = days_worked / 252;
                                                                                                                    let relief_allowance = 0.2;
                                                                                                                    
                                                                                                                    let statutory_relief = gross * relief_allowance + 200000;
                                                                                                                    let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                
                                                                                                                    let gross_perday = parseFloat(((((gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                    let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                
                                                                                                                    let taxable_income = gross - statutory_relief
                                                                                                                    let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();

                                                                                                                    let first_300 = 300000 * 0.07;
                                                                                                                    let next_300 = (taxable_income - 300000) * 0.11;

                                                                                                                    let tax = first_300 + next_300;
                                                                                                                    let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let tax_perday_formatted  = (tax_perday).toLocaleString();

                                                                                                                    let netsalary = gross - tax;
                                                                                                                    let netsalary_perday = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let netsalary_perday_formatted = (netsalary_perday).toLocaleString();

                                                                                                                    console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                    console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                    console.log(`Email = ${email} netsalary per days worked = ${netsalary_perday_formatted}\n`);
                                                            
                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                    employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                    last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                    grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                    date: checkout_date, 
                                                                                                                    net_salary:{
                                                                                                                        days_worked: days_worked,
                                                                                                                        total_netsalary: netsalary_perday
                                                                                                                    }});
                                                                        
                                                                                                                    try {
                                                                                                                        await newDailyPay.save();
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }

                                                                                                                } else if(gross >= 1000000 && gross < 2250000) {
                                                                                                                    let number_of_days_worked = days_worked / 252;
                                                                                                                    let relief_allowance = 0.2;
                                                                                                                    
                                                                                                                    let statutory_relief = gross * relief_allowance + 200000;
                                                                                                                    let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                
                                                                                                                    let gross_perday = parseFloat(((((gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                    let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                
                                                                                                                    let taxable_income = gross - statutory_relief
                                                                                                                    let taxable_income_perday = parseFloat(((((taxable_income) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let taxable_income_perday_formatted = (taxable_income_perday).toLocaleString();

                                                                                                                    let first_300 = 300000 * 0.07;
                                                                                                                    let next_300 = 300000 * 0.11;
                                                                                                                    let next_500 = 500000 * 0.15;
                                                                                                                    let next_500_2 = (taxable_income - 1100000) * 0.19;

                                                                                                                    let tax = first_300 + next_300 + next_500 + next_500_2;
                                                                                                                    let tax_perday  = parseFloat(((((tax) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let tax_perday_formatted  = (tax_perday).toLocaleString();

                                                                                                                    let netsalary = gross - tax;
                                                                                                                    let netsalary_perday = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let netsalary_perday_formatted = (netsalary_perday).toLocaleString();

                                                                                                                    console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                    console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                    console.log(`Email = ${email} netsalary per days worked = ${netsalary_perday_formatted}\n`);

                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                    employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                    last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                    grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                    date: checkout_date, 
                                                                                                                    net_salary:{
                                                                                                                        days_worked: days_worked,
                                                                                                                        total_netsalary: netsalary_perday
                                                                                                                    }});
                                                                        
                                                                                                                    try {
                                                                                                                        await newDailyPay.save();
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }

                                                                                                                } else if(gross >= 2250000 && gross < 4250000) {
                                                                                                                    let number_of_days_worked = days_worked / 252;
                                                                                                                    let relief_allowance = 0.2;
                                                                                                                    
                                                                                                                    let statutory_relief = gross * relief_allowance + 200000;
                                                                                                                    let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                
                                                                                                                    let gross_perday = parseFloat(((((gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                    let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                
                                                                                                                    let taxable_income = gross - statutory_relief
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

                                                                                                                    let netsalary = gross - tax;
                                                                                                                    let netsalary_perday = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let netsalary_perday_formatted = (netsalary_perday).toLocaleString();

                                                                                                                    console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                    console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                    console.log(`Email = ${email} netsalary per days worked = ${netsalary_perday_formatted}\n`);
                                                            
                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                    employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                    last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                    grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                    date: checkout_date, 
                                                                                                                    net_salary:{
                                                                                                                        days_worked: days_worked,
                                                                                                                        total_netsalary: netsalary_perday
                                                                                                                    }});
                                                                        
                                                                                                                    try {
                                                                                                                        await newDailyPay.save();
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }

                                                                                                                } else if(gross >= 4250000) {
                                                                                                                    let number_of_days_worked = days_worked / 252;
                                                                                                                    let relief_allowance = 0.2;
                                                                                                                    
                                                                                                                    let statutory_relief = gross * relief_allowance + 200000;
                                                                                                                    let statutory_relief_perday = parseFloat(((((statutory_relief) * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let statutory_relief_perday_formatted = (statutory_relief_perday).toLocaleString();
                                                                
                                                                                                                    let gross_perday = parseFloat(((((gross * number_of_days_worked).toFixed(2)).toLocaleString())).replace(/,/g,''))
                                                                                                                    let gross_perday_formatted = (gross_perday).toLocaleString();
                                                                
                                                                                                                    let taxable_income = gross - statutory_relief
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

                                                                                                                    let netsalary = gross - tax;
                                                                                                                    let netsalary_perday = parseFloat((((netsalary * number_of_days_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                    let netsalary_perday_formatted = (netsalary_perday).toLocaleString();

                                                                                                                    console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                    console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                    console.log(`Email = ${email} netsalary per days worked = ${netsalary_perday_formatted}\n`);
                                                            
                                                                                                                    const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                    employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                    last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                    grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                    date: checkout_date, 
                                                                                                                    net_salary:{
                                                                                                                        days_worked: days_worked,
                                                                                                                        total_netsalary: netsalary_perday
                                                                                                                    }});
                                                                        
                                                                                                                    try {
                                                                                                                        await newDailyPay.save();
                                                                                                                    } catch (error) {
                                                                                                                        next(error);
                                                                                                                    }
                                                                                                                }
                                                                                                                // 
                                                                                                            } else if(Employee_Type !== "Full-Time"){
                                                                                                                // Not a full time emplpoyee
                                                                                                                // Employee has overtime
                                                                                                                if(hour_perday > 8) {
                                                                                                                    let Extra_hours = hour_perday - 8;
                                                                                                                    // console.log("Working hours perday = 8")
                                                                                                                    // console.log(`${"Additional hours = "+Extra_hours}`);
                                                                                                                    if(gross < 30000) {
                                                                                                                        let netsalary_perhour = parseFloat((((gross / total_working_hours * 1).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();
                                                                                                                        // .toFixed(2); two decimal points;

                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        let overtime_pay = parseFloat((((netsalary_perhour * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();

                                                                                                                        let total_netsalary = parseFloat((((netsalary_perhour + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}\nEmail = ${email} hourly rate = ${netsalary_perhour_formatted}`);
                                                                                                                        console.log(`Email = ${email} extra hours worked = ${Extra_hours}\nEmail = ${email} netsalary per hours worked = ${netsalary_perhours_worked_formatted}`);
                                                                                                                        console.log(`Email = ${email} overtime pay = ${overtime_pay_formatted}\nEmail = ${email} netsalary per total hours worked + overtime pay = ${total_netsalary_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross,
                                                                                                                        hours_worked: {
                                                                                                                            hours: hour_perday,
                                                                                                                            overtime: "Worked Overtime",
                                                                                                                            addition_hours: Extra_hours
                                                                                                                        }, date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                            total_netsalary: total_netsalary
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhour = parseFloat((((netsalary / total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();

                                                                                                                        let overtime_pay = parseFloat((((netsalary_perhour * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();

                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        let total_netsalary = parseFloat((((netsalary_perhours_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}\nEmail = ${email} hourly rate = ${netsalary_perhour_formatted}`);
                                                                                                                        console.log(`Email = ${email} extra hours worked = ${Extra_hours}\nEmail = ${email} netsalary per hours worked = ${netsalary_perhours_worked_formatted}`);
                                                                                                                        console.log(`Email = ${email} overtime pay = ${overtime_pay_formatted}\nEmail = ${email} netsalary per total hours worked + overtime pay = ${total_netsalary_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross,
                                                                                                                        hours_worked: {
                                                                                                                            hours: hour_perday,
                                                                                                                            overtime: "Worked Overtime",
                                                                                                                            addition_hours: Extra_hours
                                                                                                                        }, date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                            total_netsalary: total_netsalary
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhour = parseFloat((((netsalary / total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();

                                                                                                                        let overtime_pay = parseFloat((((netsalary_perhour * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();

                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        let total_netsalary = parseFloat((((netsalary_perhours_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}\nEmail = ${email} hourly rate = ${netsalary_perhour_formatted}`);
                                                                                                                        console.log(`Email = ${email} extra hours worked = ${Extra_hours}\nEmail = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}`);
                                                                                                                        console.log(`Email = ${email} overtime pay = ${overtime_pay_formatted}\nEmail = ${email} netsalary per total hours worked + overtime pay = ${total_netsalary_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross,
                                                                                                                        hours_worked: {
                                                                                                                            hours: hour_perday,
                                                                                                                            overtime: "Worked Overtime",
                                                                                                                            addition_hours: Extra_hours
                                                                                                                        }, date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                            total_netsalary: total_netsalary
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let next_300 = (taxable_income - 300000) * 0.11;
                                                                                                                        let next_500 = 500000 * 0.15;
                                                                                                                        let next_500_2 = (taxable_income - 1100000) * 0.19;
                                                                                                                        
                                                                                                                        let tax = first_300 + next_300 + next_500 + next_500_2;
                                                                                                                        let tax_perhour =  parseFloat((((tax / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let tax_perhour_formatted = (tax_perhour).toLocaleString();

                                                                                                                        let netsalary = gross - tax;
                                                                                                                        let netsalary_perhour = parseFloat((((netsalary / total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();

                                                                                                                        let overtime_pay = parseFloat((((netsalary_perhour * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();

                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        let total_netsalary = parseFloat((((netsalary_perhours_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}\nEmail = ${email} hourly rate = ${netsalary_perhour_formatted}`);
                                                                                                                        console.log(`Email = ${email} extra hours worked = ${Extra_hours}\nEmail = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}`);
                                                                                                                        console.log(`Email = ${email} overtime pay = ${overtime_pay_formatted}\nEmail = ${email} netsalary per total hours worked + overtime pay = ${total_netsalary_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross,
                                                                                                                        hours_worked: {
                                                                                                                            hours: hour_perday,
                                                                                                                            overtime: "Worked Overtime",
                                                                                                                            addition_hours: Extra_hours
                                                                                                                        }, date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                            total_netsalary: total_netsalary
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhour = parseFloat((((netsalary / total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();

                                                                                                                        let overtime_pay = parseFloat((((netsalary_perhour * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();

                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        let total_netsalary = parseFloat((((netsalary_perhours_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}\nEmail = ${email} hourly rate = ${netsalary_perhour_formatted}`);
                                                                                                                        console.log(`Email = ${email} extra hours worked = ${Extra_hours}\nEmail = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}`);
                                                                                                                        console.log(`Email = ${email} overtime pay = ${overtime_pay_formatted}\nEmail = ${email} netsalary per total hours worked + overtime pay = ${total_netsalary_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross,
                                                                                                                        hours_worked: {
                                                                                                                            hours: hour_perday,
                                                                                                                            overtime: "Worked Overtime",
                                                                                                                            addition_hours: Extra_hours
                                                                                                                        }, date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                            total_netsalary: total_netsalary
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhour = parseFloat((((netsalary / total_working_hours * 1)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhour_formatted = (netsalary_perhour).toLocaleString();

                                                                                                                        let overtime_pay = parseFloat((((netsalary_perhour * 1.5 * Extra_hours)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let overtime_pay_formatted = (overtime_pay).toLocaleString();

                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        let total_netsalary = parseFloat((((netsalary_perhours_worked + overtime_pay)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let total_netsalary_formatted = (total_netsalary).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}\nEmail = ${email} hourly rate = ${netsalary_perhour_formatted}`);
                                                                                                                        console.log(`Email = ${email} extra hours worked = ${Extra_hours}\nEmail = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}`);
                                                                                                                        console.log(`Email = ${email} overtime pay = ${overtime_pay_formatted}\nEmail = ${email} netsalary per total hours worked + overtime pay = ${total_netsalary_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross,
                                                                                                                        hours_worked: {
                                                                                                                            hours: hour_perday,
                                                                                                                            overtime: "Worked Overtime",
                                                                                                                            addition_hours: Extra_hours
                                                                                                                        }, date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            overtime_pay: overtime_pay,
                                                                                                                            total_netsalary: total_netsalary
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

                                                                                                                    }
                                                                                                                    // Employee has no overtime
                                                                                                                } else {
                                                                                                                    if(gross < 30000) {
                                                                                                                        let netsalary_perhours_worked = parseFloat((((gross / total_working_hours * hours_worked).toFixed(2)).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();
                                                                                                                        // .toFixed(2); two decimal points;

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                        console.log(`Email = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                        date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            total_netsalary: netsalary_perhours_worked
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                        console.log(`Email = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                        date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            total_netsalary: netsalary_perhours_worked
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                        console.log(`Email = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                        date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            total_netsalary: netsalary_perhours_worked
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }
                                                                                                                        
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
                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                        console.log(`Email = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                        date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            total_netsalary: netsalary_perhours_worked
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                        console.log(`Email = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                        date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            total_netsalary: netsalary_perhours_worked
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

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
                                                                                                                        let netsalary_perhours_worked = parseFloat((((netsalary / total_working_hours * hours_worked)).toFixed(2).toLocaleString()).replace(/,/g,''));
                                                                                                                        let netsalary_perhours_worked_formatted = (netsalary_perhours_worked).toLocaleString();

                                                                                                                        console.log(`Email = ${email}\nPosition = ${Employee_Position}\nGrade = ${Employee_Grade}\nEmployee type = ${Employee_Type}`);
                                                                                                                        console.log(`Email = ${email} hours worked = ${hour_perday} (today)\nEmail = ${email} total working hours of = ${hours_worked}\nEmail = ${email} days worked = ${days_worked}`);
                                                                                                                        console.log(`Email = ${email} netsalary per total hours worked = ${netsalary_perhours_worked_formatted}\n`);

                                                                                                                        const newDailyPay = new DailyPay({staff_ID: Staff_ID,
                                                                                                                        employee_ID: Employee_ID, first_name: Employee_First_Name,
                                                                                                                        last_name: Employee_Last_Name, email: email, position: Employee_Position,
                                                                                                                        grade: Employee_Grade, gross_salary: gross, hours_worked:{hours: hour_perday}, 
                                                                                                                        date: checkout_date, 
                                                                                                                        net_salary:{
                                                                                                                            days_worked: days_worked,
                                                                                                                            total_netsalary: netsalary_perhours_worked
                                                                                                                        }});
                                                                            
                                                                                                                        try {
                                                                                                                            await newDailyPay.save();
                                                                                                                        } catch (error) {
                                                                                                                            next(error);
                                                                                                                        }

                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }).sort({createdAt: -1});
                                                                                                    // Wroking hours find one end
                                                                                                } else {
                                                                                                    res.status(200).json({"Message": "Employee has no working hours"});
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                        // Working hours with aggregate end
                                                                                    }
                                                                                }
                                                                            });
                                                                            // Payroll end
                                                                        } catch (error) {
                                                                            next(error);
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
                                    } 
                                });
                                // Entry with delete end
                            } else {       
                                try {
                                    Exit.find({email: req.body.email}, async (error, result) => { 
                                        if(error) throw error;
                                        else {
                                            if(result.length > 0) {
                                                Exit.findOneAndDelete({email: req.body.email}, async (error, result) => {
                                                    if(error) throw error;
                                                    else {
                                                        // console.log("Exit deleted");
                                                        try {
                                                            await newEntry.save();
                                                            // console.log("Added to entry");
                                                            try {
                                                                await newHistoryEntry.save();
                                                                // console.log("Added to history");
                                                            } catch (error) {
                                                                next(error);
                                                            }
                                                        } catch (error) {
                                                            next(error);
                                                        }
                                                    }
                                                })
                                            } else if(result.length === 0) {
                                                await newEntry.save();
                                                // console.log("Added to entry");
                                                try {
                                                    await newHistoryEntry.save();
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
                        res.status(200).json({"Message" : "Attendance recorded"});
                    });
                    // Entry end
                }
                else{
                    res.status(404).json({"Message": "Invalid employee email or staff ID"});
                }
            }
        });
        // Enrollment end
    } catch (error) {
        next(error);
    }
}
module.exports = recordAttendance;