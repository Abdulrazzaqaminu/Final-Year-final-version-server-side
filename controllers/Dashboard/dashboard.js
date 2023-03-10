const Entry = require("../../models/Attendance/entry");
const Exit = require("../../models/Attendance/exit");
const Enrollment = require("../../models/Enrollment/enrollment");

const dashboardAnalytics = async (req, res, next) => {
    const numberOfEmployees = Enrollment.find({$or : [{status: "Active"}, {status: "On Leave"}]});
    const numberOfEntries = Entry.find();
    const numberOfExits = Exit.find();
    Entry.find({}, {
        _id: 0, __v: 0}, (err, entryEmail) => {
        Exit.find({}, {
            _id: 0, __v: 0}, (err, exitEmail) => {
            try {
                numberOfEntries.count((error, entry) => {
                    if(error) throw error;
                    else {
                        numberOfExits.count((error, exit) => {
                            if(error) throw error;
                            else {
                                numberOfEmployees.count((error, employees) => {
                                    if(error) throw error;
                                    else {
                                        // joining entry and exit documents
                                        const table = Entry.aggregate([
                                            {
                                                $lookup: {
                                                    from: Exit,
                                                    localField: entryEmail,
                                                    foreignField: exitEmail,
                                                    as: "Attendance"
                                                }
                                            }
                                        ])
                                        res.status(200).json({
                                            "Number_of_Employees": employees,
                                            "Number_of_entries": entry,
                                            "Number_of_exits": exit,
                                            "Entry_Attendance" : table._pipeline[0].$lookup.localField,
                                            "Exit_Attendance" : table._pipeline[0].$lookup.foreignField
                                        });
                                    }
                                })
                            }
                        })
                    } 
                })
            } catch (error) {
                next(error);
            }
        })
    });
}

module.exports = dashboardAnalytics;