const AttendanceHistory = require("../../../models/Attendance/attendanceHistory");

const attendanceHistory = async (req, res, next) => {
    const {from, to, ...others} = req.query;
    try {
        AttendanceHistory.find({
            ...others,
            date: {
                $gte: from,
                $lte: to
            }
        }, (error, history) => {
            if(error) throw error;
            else {
                if(history.length > 0){
                    res.status(200).json(history);
                } else {
                    res.status(200).json(history);
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = attendanceHistory