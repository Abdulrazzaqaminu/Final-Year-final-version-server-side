const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");

const filter_by_date = async (req, res, next) => {
    try {
        AttendanceHistory.find({
            date: {
                $gte: req.body.from,
                $lte: req.body.to
            }
        }, (error, filtered_date) => {
            if(error) throw error;
            else {
                if(filtered_date.length > 0){
                    res.status(200).json(filtered_date);
                } else {
                    res.status(404).json({"Message": "No records found"});
                }
            } 
        })
    } catch (error) {
        next(error);
    }
}

const attendanceHistory = async (req, res, next) => {
    try {
        AttendanceHistory.find({}, (error, history) => {
            if(error) throw error;
            else {
                if(history.length > 0){
                    res.status(200).json(history);
                } else {
                    res.status(404).json({"Error Message": "No records found"});
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    filter_by_date,
    attendanceHistory
}