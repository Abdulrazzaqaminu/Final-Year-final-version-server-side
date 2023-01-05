const Entry = require("../../../models/Attendance/entry");
const Exit = require("../../../models/Attendance/exit");
const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");

const recordAttendance = async (req, res, next) =>{
    const newEntry = new Entry(req.body);
    const newExit = new Exit(req.body);
    const newHistory = new AttendanceHistory(req.body);
    try {
        Entry.find({email: req.body.email}, async (error, result) =>{
            if(error){
                throw error;
            } 
            else if(!error){
                if(result.length > 0){
                    Entry.findOneAndDelete({email : req.body.email}, async (error, result) =>{
                        if(error){
                            throw error;
                        } 
                        else{
                            // console.log("Entry deleted");
                            try {
                                await newExit.save();
                                // console.log("Added to exit")
                                try {
                                    const recordedHistory = await newHistory.save();
                                    // console.log("Added to history")
                                } catch (error) {
                                    next(error);
                                }
                            } catch (error) {
                                next(error);
                            }
                        } 
                    })
                } 
                else{       
                    try {
                        Exit.find({email: req.body.email}, async (error, result) =>{
                            if(error){
                                throw error;
                            }
                            else if(!error){
                                if(result.length > 0){
                                    Exit.findOneAndDelete({email: req.body.email}, async (error, result) =>{
                                        if(error){
                                            throw error;
                                        }
                                        else{
                                            // console.log("Exit deleted");
                                            try {
                                                await newEntry.save();
                                                // console.log("Added to entry");
                                                try {
                                                    await newHistory.save();
                                                    // console.log("Added to history");
                                                } catch (error) {
                                                    next(error);
                                                }
                                            } catch (error) {
                                                next(error);
                                            }
                                        }
                                    })
                                }
                                else if(result.length === 0){
                                    const recordedEntry = await newEntry.save();
                                    // console.log("Added to entry");
                                    try {
                                        await newHistory.save();
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
    } catch (error) {
        next(error);
    }
}

module.exports = recordAttendance;