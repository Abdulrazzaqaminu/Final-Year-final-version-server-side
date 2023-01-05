const Enrollment = require("../../models/Enrollment/enrollment");
// const Payroll = require("../../models/Payroll/payroll");
const Loans = require("../../models/Loans/loans");

const loanPayment = async (req, res, next) =>{
    const EmployeeID = req.params.employeeID;
    const validLoan = await Enrollment.findById(EmployeeID)
    const newLoan = new Loans({
        staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
        email: req.body.email, loan_amount: req.body.loan_amount, approval_date: req.body.approval_date,
        employee_ID: EmployeeID,
        loan_duration: {
            from: req.body.loan_duration.from,
            to: req.body.loan_duration.to
        }, loan_details: req.body.loan_details
    });
    if(validLoan){
        try {
            Loans.find({email: req.body.email}, async (error, result) =>{
                if(error){
                    throw error;
                }
                else if(!error){
                    if(result.length > 0){
                        res.status(200).json({"Error_Message": "Employee has an unpaid loan"})
                    }
                    else{
                        try {
                            const savedLoan = await newLoan.save();
                            await Enrollment.findByIdAndUpdate(EmployeeID, {
                                $push: {
                                    loans:{
                                        loan_id: savedLoan._id,
                                        amount: savedLoan.loan_amount
                                    }
                                }
                            })
                            res.status(200).json(savedLoan);
                        } catch (error) {
                            next(error);
                        }
                    }
                }
            })
        } catch (error) {
            next(error);
        }
    }
    else if(!validLoan){
        res.status(404).json("no");
    }
}

const getLoans = async (req, res, next) =>{
    try {
        const loans = await Loans.find();
        res.status(200).json(loans);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    loanPayment,
    getLoans
};