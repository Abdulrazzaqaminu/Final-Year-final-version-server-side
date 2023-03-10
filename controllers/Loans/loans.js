const Enrollment = require("../../models/Enrollment/enrollment");
const Payroll = require("../../models/Payroll/payroll");
const Loans = require("../../models/Loans/loans");

const loanPayment = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.staff_ID) {
        emptyFields.push("staff_ID");
    } if(!req.body.loan_amount) {
        emptyFields.push("loan_amount");
    } if(!req.body.approval_date) {
        emptyFields.push("approval_date");
    } if(!req.body.loan_duration.from) {
        emptyFields.push("from");
    } if(!req.body.loan_duration.to) {
        emptyFields.push("to");
    } if(!req.body.loan_details) {
        emptyFields.push("loan_details");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate fields", emptyFields})
    } else {
        const double_space = /\s\s/
        const correct_language = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/
        if(double_space.test(req.body.loan_details)) {
            res.status(400).json({"Message": "Invalid whitespace at description"})
        } else if(correct_language.test(req.body.loan_details)) {
            Enrollment.find({staff_ID: req.body.staff_ID}, (error, result) => {
                if(error) throw error;
                else {
                    if(result.length > 0) {
                        try {
                            let Employee_Email = result[0].email;
                            let Staff_ID = result[0].staff_ID;
                            let Employee_ID = result[0]._id;
                            let Employee_First_Name = result[0].first_name;
                            let Employee_Last_Name = result[0].last_name;
                            Enrollment.find({email: Employee_Email, status: "Terminated"}, (error, result) => {
                                if(error) throw error;
                                else {
                                    if(result.length > 0) {
                                        res.status(400).json({"Message": "Terminated employees cannot request for loans"});
                                    } else {
                                        const newLoan = new Loans({
                                            staff_ID: Staff_ID, first_name: Employee_First_Name, last_name: Employee_Last_Name,
                                            email: Employee_Email, loan_amount: req.body.loan_amount, approval_date: req.body.approval_date,
                                            employee_ID: Employee_ID,
                                            loan_duration: {
                                                from: req.body.loan_duration.from,
                                                to: req.body.loan_duration.to
                                            }, loan_details: req.body.loan_details
                                        });
                                        Payroll.find({email: Employee_Email, staff_ID: Staff_ID}, {loans: 1, _id: 0}, async (error, result) => {
                                            if(error) throw error;
                                            else {
                                                if(result[0].loans.length > 0) {
                                                    res.status(400).json({"Message": "Employee has an unpaid loan"});
                                                } else {
                                                    try {
                                                        const savedLoan = await newLoan.save();
                                                        Payroll.findOneAndUpdate({email: Employee_Email}, {
                                                            $push: {
                                                                loans:savedLoan.loan_amount
                                                            },
                                                        }, (error, rs) => {
                                                            if(error) throw error;
                                                            else {
                                                                if(rs) {
                                                                    res.status(200).json({"Message": "Loan was successful", savedLoan});
                                                                }
                                                            }
                                                        })
                                                    } catch (error) {
                                                        next(error);
                                                    }
                                                }
                                                
                                            }
                                        })
                                    }
                                }
                            })
                            
                        } catch (error) {
                            next(error);
                        }
                    } else {
                        res.status(404).json({"Message": "Employee not found"});
                    }
                }
            })
        } else {
            res.status(400).json({"Message": "Whitespace at the begining or end of description"})
        }
    }
}

const getLoans = async (req, res, next) => {
    try {
        Loans.find({}, (error, loan) => {
            if(error) throw error;
            else {
                if(loan.length > 0) {
                    res.status(200).json(loan);
                } else {
                    res.status(404).json({"Message": "No loans have been made", loan});
                }
            }
        }).sort({createdAt: -1})
    } catch (error) {
        next(error);
    }
}

const getSingleEmployeeLoan = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.find({_id: Employee_ID}, (error, employee) => {
            if(error) throw error;
            else {
                if(employee.length > 0) {
                    Loans.find({employee_ID: Employee_ID}, (error, employee_loan) => {
                        if(error) throw error;
                        else {
                            if(employee_loan.length > 0) {
                                res.status(200).json(employee_loan);
                            } else {
                                res.status(404).json({"Message": "Employee has no loans"});
                            }
                        }
                    });
                } else {
                    res.status(404).json({"Message": "Employee not found"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const clearLoan = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.find({_id: Employee_ID}, (error, employee) => {
            if(error) throw error;
            else {
                if(employee.length > 0) {
                    Loans.find({employee_ID: Employee_ID}, (error, employee_loan) => {
                        if(error) throw error;
                        else{
                            if(employee_loan.length > 0){
                                const Loan_Amount = employee_loan[0].loan_amount;
                                console.log(Loan_Amount);
                                Payroll.findOneAndUpdate({employee_id: Employee_ID}, {
                                    $pull: {
                                        loans: Loan_Amount
                                    }
                                }, (error, employee_loan) => {
                                    if(error) throw error;
                                    else {
                                        res.status(400).json({"Message" : "Employees loan has been cleared"});
                                    }
                                })
                            } else {
                                res.status(404).json({"Message" : "Employee has no loan"});
                            }
                        }
                    }).sort({createdAt: -1})
                } else {
                    res.status(404).json({"Message" : "Employee not found"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    loanPayment,
    getLoans,
    getSingleEmployeeLoan,
    clearLoan
};