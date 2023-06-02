const Enrollment = require("../../models/Enrollment/enrollment");
const Hod = require("../../models/Department/hod");
const Leave = require("../../models/Leave/leave");
const Loans = require("../../models/Loans/loans");
const Payroll = require("../../models/Payroll/payroll");

const filterAll = async (req, res, next) => {
    try {
        const { filterModel } = req.body;
        switch (filterModel) {
            case "Enrollment":
                Enrollment.find({}, {qrcode: 0}, (error, enmployees) => {
                    if(error) throw error;
                    else {
                        if(enmployees.length > 0) {
                            res.status(200).json(enmployees);
                        } else {
                            res.status(400).json({"Message": "No employees found"});
                        }
                    }
                });
                break;
            case "Hod":
                Hod.find({}, (error, hods) => {
                    if(error) throw error;
                    else {
                        if(hods.length > 0) {
                            res.status(200).json(hods);
                        } else {
                            res.status(400).json({"Message": "No hods found"});
                        }
                    }
                });
                break;
            case "Leave":
                Leave.find({}, (error, leaves) => {
                    if(error) throw error;
                    else {
                        if(leaves.length > 0) {
                            res.status(200).json(leaves);
                        } else {
                            res.status(400).json({"Message": "No leaves found"});
                        }
                    }
                });
                break;
            case "Loans":
                Loans.find({}, (error, loans) => {
                    if(error) throw error;
                    else {
                        if(loans.length > 0) {
                            res.status(200).json(loans);
                        } else {
                            res.status(400).json({"Message": "No loans found"});
                        }
                    }
                });
                break;
            case "Payroll":
                Payroll.find({}, (error, payrolls) => {
                    if(error) throw error;
                    else {
                        if(payrolls.length > 0) {
                            res.status(200).json(payrolls);
                        } else {
                            res.status(400).json({"Message": "No payrolls found"});
                        }
                    }
                });
                break;
            default:
                res.json({"Message": "Pick category to filter"})
                break;
        }
    } catch (error) {
        next(error);
    }
}

module.exports = filterAll;