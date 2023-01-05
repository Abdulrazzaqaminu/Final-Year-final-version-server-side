const Payroll = require("../../models/Payroll/payroll");

const getSpecificPayroll = async (req, res, next) =>{
    const EmployeeID = req.params.employeeID;
    try {
        const employeePayroll = await Payroll.find({employee_id: EmployeeID});
        res.status(200).json(employeePayroll)
    } catch (error) {
        next(error);
    }
}

const getPayrolls = async (req, res, next) =>{
    try {
        const payrolls = await Payroll.find();
        res.status(200).json(payrolls);
    } catch (error) {
        next(error);   
    }
}

module.exports = {
    getSpecificPayroll,
    getPayrolls
};