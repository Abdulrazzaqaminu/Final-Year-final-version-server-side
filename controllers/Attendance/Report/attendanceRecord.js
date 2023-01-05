const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");

const filter_by_date = async (req, res, next) =>{
    try {
        const filtered_date = await AttendanceHistory.find({
            date: {
                $gte: req.body.from,
                $lte: req.body.to
            }
        })
        res.status(200).json(filtered_date);
    } catch (error) {
        next(error);
    }
}

const attendanceHistory = async (req, res, next) =>{
    try {
        const historyList = await AttendanceHistory.find();
        res.status(200).json(historyList);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    filter_by_date,
    attendanceHistory
}