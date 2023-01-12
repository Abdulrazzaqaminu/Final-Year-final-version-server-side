const Entry = require("../../../models/Attendance/entry");
const Exit = require("../../../models/Attendance/exit");
const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");
const WorkingHours = require("../../../models/Attendance/working_hours");
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
                                                            console.log(req.body.email+' checkout date '+checkout_date+' '+checkout_time);
                                                            // getting check-in date and time
                                                            try {
                                                                AttendanceHistory.find({email: req.body.email, out_time: "Still In"},{_id: 1, email: 1, date: 1, in_time: 1}, async (error, in_date_time) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        checkin_date = in_date_time[0].date;
                                                                        checkin_time = in_date_time[0].in_time;
                                                                        console.log(req.body.email+' checkin date '+checkin_date+' '+checkin_time);

                                                                        // calculating hours
                                                                        let checkout = new Date(checkout_date+' '+checkout_time);
                                                                        console.log(checkout);
                                                                        let checkin = new Date(checkin_date+' '+checkin_time);
                                                                        console.log(checkin);

                                                                        // getting time difference
                                                                        let timediff = checkout.getTime() - checkin.getTime();
                                                                        console.log(`Time difference in milliseconds = ${timediff}`);

                                                                        // converting to hours, minutes and seconds
                                                                        let msec = timediff;
                                                                        let hh = Math.floor(msec / 1000 / 60 / 60);
                                                                        msec -= hh * 1000 * 60 * 60;
                                                                        let mm = Math.floor(msec / 1000 / 60);
                                                                        msec -= mm * 1000 * 60;
                                                                        let ss = Math.floor(msec / 1000);
                                                                        msec -= ss * 1000;
                                                                        console.log(`${req.body.email} worked for ${hh} hours, ${mm} minutes and ${ss} seconds`);

                                                                        // saving to working hours collection
                                                                        let Hours = hh; 
                                                                        let Minutes = mm;
                                                                        let Seconds = ss;
                                                                        const newWorking_hours = new WorkingHours({staff_ID: req.body.staff_ID, 
                                                                        first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, 
                                                                        date: req.body.date, hours: Hours, minutes: Minutes, seconds: Seconds});
                                                                        try {
                                                                            await newWorking_hours.save();
                                                                        } catch (error) {
                                                                            next(error);
                                                                        }
                                                                    }
                                                                }).sort({date: -1, in_time: -1, email: -1})
                                                            } catch (error) {
                                                                next(error);
                                                            }
                                                        }
                                                    }).sort({date: -1, out_time: -1, email: -1})
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
                                })
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
                        res.status(200).json({"success_status" : 200});
                    })
                }
                else{
                    res.status(404).json({"Message": "Invalid employee email or staff ID"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}
module.exports = recordAttendance;