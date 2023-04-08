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

const attendanceFilter = async (req, res, next) => {
    const {from, to, ...others} = req.query;
    const dateConvertIsoString = (date) => {
        const day = new Date(date);
        var time = day.getTime()
        var timeOffSet = day.getTimezoneOffset()
        var date_formatted = new Date(time - timeOffSet*60*1000).toISOString().substr(0,10).replace('T', ' ');
        return date_formatted;
    }
    const datePlus = (date, no) => {
        const day = new Date(date);
        day.setDate(day.getDate() + no);
        return day;
    }
    const toFormatted = dateConvertIsoString(datePlus(from, 5));
    const Staff_ID = others.staff_ID;
    if (to < toFormatted || to > toFormatted) {
        res.status(400).json({"Message" : "Days between should be 5"})
    } else {
        try {
            AttendanceHistory.find({
                $or: [
                    Staff_ID ? 
                    (
                        {
                            staff_ID: Staff_ID,
                            date: {
                                $gte: from,
                                $lte: to
                            }
                        }
                    ) : 
                    (
                        {
                            date: {
                                $gte: from,
                                $lte: to
                            }
                        }
                    )
                ]
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
}

module.exports = {
    attendanceHistory,
    attendanceFilter
}