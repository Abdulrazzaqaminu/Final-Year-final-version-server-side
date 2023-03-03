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
        }, (error, result) => {
            if(error) throw error;
            else {
                if(result.length > 0){
                    res.status(200).json(result);
                } else {
                    res.status(404).json({"Message": "No records found",result});
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = attendanceHistory