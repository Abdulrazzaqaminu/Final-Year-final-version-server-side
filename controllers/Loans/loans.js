const Enrollment = require("../../models/Enrollment/enrollment");
const Payroll = require("../../models/Payroll/payroll");
const Loans = require("../../models/Loans/loans");

const loanPayment = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    const newLoan = new Loans({
        staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
        email: req.body.email, loan_amount: req.body.loan_amount, approval_date: req.body.approval_date,
        employee_ID: Employee_ID,
        loan_duration: {
            from: req.body.loan_duration.from,
            to: req.body.loan_duration.to
        }, loan_details: req.body.loan_details
    });
    Enrollment.find({_id: Employee_ID}, (error, result) => {
        if(error) throw error;
        else {
            if(result.length > 0) {
                try {
                    Enrollment.find({email: req.body.email, staff_ID: req.body.staff_ID}, (error, result) => {
                        if(error) throw error;
                        else {
                            if(result.length > 0) {
                                Payroll.find({employee_id: Employee_ID, email: req.body.email}, {loans: 1, _id: 0}, async (error, result) => {
                                    if(error) throw error;
                                    else {
                                        if(result[0].loans.length > 0) {
                                            res.status(200).json({"Message": "Employee has an unpaid loan"});
                                        } else {
                                            try {
                                                const savedLoan = await newLoan.save();
                                                await Payroll.findOneAndUpdate({email: req.body.email}, {
                                                    $push: {
                                                        loans:savedLoan.loan_amount
                                                    }
                                                })
                                                res.status(200).json(savedLoan);
                                            } catch (error) {
                                                next(error);
                                            }
                                        }
                                        
                                    }
                                })
                            } else {
                                res.status(404).json({"Message": "Invalid employee email or staff ID"});
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
}

const getLoans = async (req, res, next) => {
    try {
        Loans.find({}, (error, loan) => {
            if(error) throw error;
            else {
                if(loan.length > 0) {
                    res.status(200).json(loan);
                } else {
                    res.status(404).json({"Message": "No loans have been made"});
                }
            }
        });
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