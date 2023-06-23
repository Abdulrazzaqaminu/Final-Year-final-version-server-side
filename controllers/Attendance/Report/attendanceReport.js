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
    const Staff_ID = others.staff_ID;
    const hour = others.hour;
    const hour2 = others.hour2;
    try {
        AttendanceHistory.find({
            $or: [
                Staff_ID ? 
                (
                    hour ? 
                    (
                        hour2 ?
                        (
                            hour < 12 ? 
                            (
                                {
                                    staff_ID: Staff_ID,
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour,
                                        $lte: hour2
                                    },
                                    out_time: "Still In"
                                }
                            ) :
                            (
                                {
                                    staff_ID: Staff_ID,
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour
                                    },
                                    in_time: "Checked Out"
                                }
                            )
                        ) :
                        (
                            hour < 12 ? 
                            (
                                {
                                    staff_ID: Staff_ID,
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour
                                    },
                                    out_time: "Still In"
                                }
                            ) :
                            (
                                {
                                    staff_ID: Staff_ID,
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour
                                    },
                                    in_time: "Checked Out"
                                }
                            )
                        )
                        
                    ) :
                    (
                        {
                            staff_ID: Staff_ID,
                            date: {
                                $gte: from,
                                $lte: to
                            }
                        }
                    )
                ) : 
                (
                    hour ? 
                    (
                        hour2 ?
                        (
                            hour < 12 ? 
                            (
                                {
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour,
                                        $lte: hour2
                                    },
                                    out_time: "Still In"
                                }
                            ) :
                            (
                                {
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour
                                    },
                                    in_time: "Checked Out"
                                }
                            )
                        ) :
                        (
                            hour < 12 ? 
                            (
                                {
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour
                                    },
                                    out_time: "Still In"
                                }
                            ) :
                            (
                                {
                                    date: {
                                        $gte: from,
                                        $lte: to
                                    },
                                    hour: {
                                        $gte: hour
                                    },
                                    in_time: "Checked Out"
                                }
                            )
                        )
                    ) :
                    (
                        {
                            date: {
                                $gte: from,
                                $lte: to
                            }
                        }
                    )
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

module.exports = {
    attendanceHistory,
    attendanceFilter
}