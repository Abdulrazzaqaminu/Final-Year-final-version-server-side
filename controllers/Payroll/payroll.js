const Payroll = require("../../models/Payroll/payroll");
const Enrollment = require("../../models/Enrollment/enrollment");

const getSpecificPayroll = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.find({_id: Employee_ID}, (error, employee) => {
            if(error) throw error;
            else {
                if (employee.length > 0) {
                    // just to be safe THIS SHOULD NEVER OCCUR
                    Payroll.find({employee_id: Employee_ID}, (error, employee_payroll) => {
                        if(error) throw error;
                        else {
                            if (employee_payroll.length > 0) {
                                res.status(200).json(employee_payroll);
                            } else {
                                res.status(404).json({"Message": "Employee is not on payroll"});
                            }
                        }
                    });
                    // 
                } else {
                    res.status(404).json({"Message": "Employee does not exist"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const getPayrolls = async (req, res, next) => {
    try {
        Payroll.find({}, (error, payroll) => {
            if(error) throw error;
            else {
                if (payroll.length > 0) {
                    res.status(200).json(payroll);
                } else {
                    res.status(404).json({"Message": "No employees enrolled so no payrolls"});
                }
            }
        });
    } catch (error) {
        next(error);   
    }
}

module.exports = {
    getSpecificPayroll,
    getPayrolls
};