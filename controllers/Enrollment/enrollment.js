const Enrollment = require("../../models/Enrollment/enrollment");
const Payroll = require("../../models/Payroll/payroll");

const enrollEmployee = async (req, res, next) => {
    if(req.body.position === 1) {
        if(req.body.grade === 1) {
            var Salary = 20000
        } else if(req.body.grade === 2) {
            var Salary = 25000
        } else if(req.body.grade === 3) {
            var Salary = 30000
        }
    } else if(req.body.position === 2) {
        if(req.body.grade === 1) {
            var Salary = 500000
        } else if(req.body.grade === 2) {
            var Salary = 700000
        } else if(req.body.grade === 3) {
            var Salary = 900000
        }
    } else if(req.body.position === 3) {
        if(req.body.grade === 1) {
            var Salary = 1750000
        } else if(req.body.grade === 2) {
            var Salary = 3250000
        } else if(req.body.grade === 3) {
            var Salary = 5000000
        }
    }
    const newEmployee = new Enrollment({
        staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
        email: req.body.email, date_of_birth: req.body.date_of_birth, phone_number: req.body.phone_number,
        department: req.body.department, unit: req.body.unit, position: req.body.position,
        grade: req.body.grade, enrollment_date: req.body.enrollment_date, salary: Salary,
        address: {
            state: req.body.address.state, 
            city: req.body.address.city, 
            street: req.body.address.street
        }
    });
    try {
        Enrollment.find({staff_ID: req.body.staff_ID, email: req.body.email}, async (error, employee) => {
            if(error) throw error;
            else{
                if(employee.length > 0) {
                    res.status(200).json({"Message": "Staff ID or Email already exist"});
                } else {
                    // console.log(req.body.address.state);
                    const enrolledEmployee = await newEmployee.save();
                    try {
                        const employeePayroll = new Payroll({
                            staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
                            email: req.body.email, enrollment_date: req.body.enrollment_date, employee_id: newEmployee._id, 
                            annual_gross: Salary
                        })
                        await employeePayroll.save();
                        res.status(200).json(enrolledEmployee);
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

const getEmployees = async (req, res, next) => {
    try {
        Enrollment.find({}, (error, employees) => {
            if(error) throw error;
            else {
                if(employees.length > 0) {
                    res.status(200).json(employees);
                } else {
                    res.status(404).json({"Message": "No employees enrolled"});
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

const getSingleEmployee = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.find({_id: Employee_ID}, (error, single_employee) => {
            if(error) throw error;
            else {
                if(single_employee.length > 0) {
                    res.status(200).json(single_employee);
                } else {
                    res.status(404).json({"Message": "Employee does not exist"});
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    enrollEmployee,
    getEmployees,
    getSingleEmployee
};