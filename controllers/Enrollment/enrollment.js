const Enrollment = require("../../models/Enrollment/enrollment");
const Department = require("../../models/Department/department");
const Hod = require("../../models/Department/hod");
const Unit = require("../../models/Department/unit"); 
const Loans = require("../../models/Loans/loans");
const Payroll = require("../../models/Payroll/payroll");
const AttendanceHistory = require("../../models/Attendance/attendanceHistory");
const Entry = require("../../models/Attendance/entry");
const Exit = require("../../models/Attendance/exit");
const WorkingHours = require("../../models/Attendance/working_hours");
const DailyPay = require("../../models/Daily_Pay/daily_pay");
const qrcode = require("qrcode");

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
    qrcode.toFile(req.body.email+".png",req.body.email);
    qrcode.toDataURL(req.body.email, (error, qr) => {
        if(error) throw error;
        else {
            const newEmployee = new Enrollment({
                staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
                email: req.body.email, date_of_birth: req.body.date_of_birth, phone_number: req.body.phone_number,
                department: req.body.department, unit: req.body.unit, position: req.body.position,
                grade: req.body.grade, enrollment_date: req.body.enrollment_date, gross_salary: Salary,
                address: {
                    state: req.body.address.state, 
                    city: req.body.address.city, 
                    street: req.body.address.street
                }, qrcode: qr
            });
            try {
                Enrollment.findOne({staff_ID: req.body.staff_ID}, (error, employee) => {
                    if(error) throw error;
                    else{
                        if(employee) {
                            res.status(200).json({"Message": "Staff ID or Email already exist"});
                        } else {
                            Enrollment.findOne({email: req.body.email}, (error, rs) => {
                                if(error) throw error;
                                else {
                                    if(rs) {
                                        res.status(200).json({"Message": "Staff ID or Email already exist"});
                                    } else {
                                        // console.log(req.body.address.state);
                                        Department.findOne({dept_name: req.body.department}, (error, department) => {
                                            if(error) throw error;
                                            else {
                                                if(department) {
                                                    Unit.findOne({unit_name: req.body.unit}, (error, unit) => {
                                                        if(error) throw error;
                                                        else {
                                                            if(unit) {
                                                                // checking if the unit given is under the department given
                                                                Unit.find({unit_name: req.body.unit},{dept_id: 1, _id: 0}, (error, rs) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(rs.length > 0) {
                                                                            const Department_ID = rs[0].dept_id;
                                                                            console.log(Department_ID);
                                                                            Department.findOne({_id: Department_ID, dept_name: req.body.department}, async (error, rs) => {
                                                                                if(error) throw error;
                                                                                else {
                                                                                    if(rs) {
                                                                                        const enrolledEmployee = await newEmployee.save();
                                                                                        try {
                                                                                            const employeePayroll = new Payroll({
                                                                                                staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
                                                                                                email: req.body.email, enrollment_date: req.body.enrollment_date, employee_id: newEmployee._id, 
                                                                                                annual_gross: Salary
                                                                                            });
                                                                                            await employeePayroll.save();
                                                                                            try {
                                                                                                Department.findOneAndUpdate(
                                                                                                    {dept_name: req.body.department}, 
                                                                                                    {
                                                                                                        $push: {
                                                                                                            employee_ids: enrolledEmployee._id
                                                                                                        }
                                                                                                    },
                                                                                                    (error, dept_updated) => {
                                                                                                    if(error) throw error;
                                                                                                    else {
                                                                                                        Unit.findOneAndUpdate(
                                                                                                            {unit_name: req.body.unit},
                                                                                                            {
                                                                                                                $push: {
                                                                                                                    employee_ids: enrolledEmployee._id
                                                                                                                }
                                                                                                            }, 
                                                                                                            (error, unit_updated) => {
                                                                                                                if(error) throw error
                                                                                                                else {
                                                                                                                    res.status(200).json(enrolledEmployee);
                                                                                                                }
                                                                                                            }
                                                                                                        )
                                                                                                    }
                                                                                                });
                                                                                            } catch (error) {
                                                                                                next(error);
                                                                                            }
                                                                                        } catch (error) {
                                                                                            next(error);
                                                                                        }
                                                                                        // console.log("unit is under department");
                                                                                    } else {
                                                                                        res.status(404).json({"Message": "Unit is not under department"});
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                });
                                                                // 
                                                                // res.status(200).json({"Message": "unit exits"});
                                                            } else {
                                                                res.status(404).json({"Message": "Unit given does not exist"});
                                                            }
                                                        }
                                                    });
                                                    // res.status(200).json({"Message": "matches"});
                                                } else {
                                                    res.status(404).json({"Message": " Department given does not exist"});
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            } catch (error) {
                next(error);
            }
        }
    })
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

const edit_employee = async (req, res, next) => {
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
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.findById(Employee_ID, (error, employee) => {
            if(error) throw error;
            else {
                if(employee) {
                    const EMAIL = employee.email;
                    const STAFF_ID = employee.staff_ID;
                    const HOD_ID = employee._id;

                    // if employee is a HOD
                    Hod.findOneAndUpdate(
                        {employee_id: Employee_ID},
                        {
                            hod_id: HOD_ID,
                            hod_first_name: req.body.first_name,
                            hod_last_name: req.body.last_name,
                            hod_email: EMAIL
                        },
                        (error, hod) => {
                            if(error) throw error;
                            else {
                                if(hod) {
                                    Enrollment.findOneAndUpdate(
                                        {_id: Employee_ID},
                                        {
                                            first_name: req.body.first_name,
                                            last_name: req.body.last_name,
                                            phone_number: req.body.phone_number,
                                            position: req.body.position,
                                            grade: req.body.grade,
                                            salary: Salary,
                                            address: {
                                                state: req.body.address.state,
                                                city: req.body.address.city,
                                                street: req.body.address.street
                                            }
                                        },
                                        (error, employee) => {
                                            if(error) throw error;
                                            else {
                                                Department.findOneAndUpdate(
                                                    {"dept_HOD.hod_id": Employee_ID},
                                                    {
                                                        dept_HOD: {
                                                            hod_id: HOD_ID,
                                                            hod_first_name: req.body.first_name,
                                                            hod_last_name: req.body.last_name,
                                                            hod_email: EMAIL
                                                        }
                                                    },
                                                    (error, hod_department) => {
                                                        if(error) throw error;
                                                        else {
                                                            Payroll.findOneAndUpdate(
                                                                {employee_id: Employee_ID},
                                                                {
                                                                    first_name: req.body.first_name,
                                                                    last_name: req.body.last_name,
                                                                    annual_gross: Salary
                                                                },
                                                                (error, employee_payroll) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        Loans.findOneAndUpdate(
                                                                            {employee_ID: Employee_ID},
                                                                            {
                                                                                first_name: req.body.first_name,
                                                                                last_name: req.body.last_name,
                                                                            },
                                                                            (error, employee_loan) => {
                                                                                if(error) throw error;
                                                                                else {
                                                                                    Entry.findOneAndUpdate(
                                                                                        {email: EMAIL, staff_ID: STAFF_ID},
                                                                                        {
                                                                                            first_name: req.body.first_name,
                                                                                            last_name: req.body.last_name,
                                                                                        },
                                                                                        (error, entry) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                Exit.findOneAndUpdate(
                                                                                                    {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                    {
                                                                                                        first_name: req.body.first_name,
                                                                                                        last_name: req.body.last_name,
                                                                                                    },
                                                                                                    (error, exit) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            AttendanceHistory.updateMany(
                                                                                                                {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                {
                                                                                                                    first_name: req.body.first_name,
                                                                                                                    last_name: req.body.last_name,
                                                                                                                },
                                                                                                                (error, history) => {
                                                                                                                    if(error) throw error;
                                                                                                                    else {
                                                                                                                        WorkingHours.updateMany(
                                                                                                                            {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                            {
                                                                                                                                first_name: req.body.first_name,
                                                                                                                                last_name: req.body.last_name,
                                                                                                                            },
                                                                                                                            (error, working_hours) => {
                                                                                                                                if(error) throw error;
                                                                                                                                else {
                                                                                                                                    DailyPay.updateMany(
                                                                                                                                        {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                        {
                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                            position: req.body.position,
                                                                                                                                            grade: req.body.grade,
                                                                                                                                            gross_salary: Salary
                                                                                                                                        },
                                                                                                                                        (error, dailypay) => {
                                                                                                                                            if(error) throw error;
                                                                                                                                            else {
                                                                                                                                                res.status(200).json({"Message": "Employee updated"});
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    );
                                                                                                                                }
                                                                                                                            }
                                                                                                                        )
                                                                                                                    }
                                                                                                                }
                                                                                                            )
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                            }
                                                                                        }
                                                                                    )
                                                                                }
                                                                            }
                                                                        )
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    )
                                } else {
                                    // checking if department passed is valid
                                    Department.findOne({dept_name: req.body.department}, (error, department) => {
                                        if(error) throw error;
                                        else {
                                            if(department) {
                                                Unit.findOne({unit_name: req.body.unit}, (error, unit) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(unit) {
                                                            // checking if unit given is under department given
                                                            const Department_ID = unit.dept_id;
                                                            Department.findOne({_id: Department_ID, dept_name: req.body.department}, (error, rs) => {
                                                                if(error) throw error;
                                                                else {
                                                                    if(rs) {
                                                                        // if department is not changed
                                                                        Department.findOne({employee_ids: Employee_ID, dept_name: req.body.department}, (error, rs) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                if(rs) {
                                                                                    // if unit is not changed
                                                                                    Unit.findOne({employee_ids: Employee_ID, unit_name: req.body.unit}, (error, unit) => {
                                                                                        if(error) throw error;
                                                                                        else {
                                                                                            if(unit) {
                                                                                                Enrollment.findOneAndUpdate(
                                                                                                    {_id: Employee_ID},
                                                                                                    {
                                                                                                        first_name: req.body.first_name,
                                                                                                        last_name: req.body.last_name,
                                                                                                        phone_number: req.body.phone_number,
                                                                                                        department: req.body.department,
                                                                                                        unit: req.body.unit,
                                                                                                        position: req.body.position,
                                                                                                        grade: req.body.grade,
                                                                                                        salary: Salary,
                                                                                                        address: {
                                                                                                            state: req.body.address.state,
                                                                                                            city: req.body.address.city,
                                                                                                            street: req.body.address.street
                                                                                                        }
                                                                                                    },
                                                                                                    (error, employee) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            Payroll.findOneAndUpdate(
                                                                                                                {employee_id: Employee_ID},
                                                                                                                {
                                                                                                                    first_name: req.body.first_name,
                                                                                                                    last_name: req.body.last_name,
                                                                                                                    annual_gross: Salary
                                                                                                                },
                                                                                                                (error, employeePayroll) => {
                                                                                                                    if(error) throw error;
                                                                                                                    else {
                                                                                                                        Loans.findOneAndUpdate(
                                                                                                                            {employee_ID: Employee_ID},
                                                                                                                            {
                                                                                                                                first_name: req.body.first_name,
                                                                                                                                last_name: req.body.last_name,
                                                                                                                            },
                                                                                                                            (error, employee_loan) => {
                                                                                                                                if(error) throw error;
                                                                                                                                else {
                                                                                                                                    Entry.findOneAndUpdate(
                                                                                                                                        {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                        {
                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                        },
                                                                                                                                        (error, entry) => {
                                                                                                                                            if(error) throw error;
                                                                                                                                            else {
                                                                                                                                                Exit.findOneAndUpdate(
                                                                                                                                                    {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                    {
                                                                                                                                                        first_name: req.body.first_name,
                                                                                                                                                        last_name: req.body.last_name,
                                                                                                                                                    },
                                                                                                                                                    (error, exit) => {
                                                                                                                                                        if(error) throw error;
                                                                                                                                                        else {
                                                                                                                                                            AttendanceHistory.updateMany(
                                                                                                                                                                {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                {
                                                                                                                                                                    first_name: req.body.first_name,
                                                                                                                                                                    last_name: req.body.last_name,
                                                                                                                                                                },
                                                                                                                                                                (error, history) => {
                                                                                                                                                                    if(error) throw error;
                                                                                                                                                                    else {
                                                                                                                                                                        WorkingHours.updateMany(
                                                                                                                                                                            {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                            {
                                                                                                                                                                                first_name: req.body.first_name,
                                                                                                                                                                                last_name: req.body.last_name,
                                                                                                                                                                            },
                                                                                                                                                                            (error, working_hours) => {
                                                                                                                                                                                if(error) throw error;
                                                                                                                                                                                else {
                                                                                                                                                                                    DailyPay.updateMany(
                                                                                                                                                                                        {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                        {
                                                                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                                                                            position: req.body.position,
                                                                                                                                                                                            grade: req.body.grade,
                                                                                                                                                                                            gross_salary: Salary
                                                                                                                                                                                        },
                                                                                                                                                                                        (error, dailypay) => {
                                                                                                                                                                                            if(error) throw error;
                                                                                                                                                                                            else {
                                                                                                                                                                                                res.status(200).json({"Message": "Employee updated"});
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    );
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        )
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            )
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                )
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    )
                                                                                                                                }
                                                                                                                            }
                                                                                                                        )
                                                                                                                    }
                                                                                                                }
                                                                                                            )
                                                                                                        }
                                                                                                    }
                                                                                                ) 
                                                                                            } else {
                                                                                                // if unit is changed
                                                                                                Unit.findOneAndUpdate(
                                                                                                    {employee_ids: Employee_ID},
                                                                                                    {
                                                                                                        $pull: {
                                                                                                            employee_ids: Employee_ID
                                                                                                        }
                                                                                                    },
                                                                                                    (error, rs) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            Unit.findOneAndUpdate(
                                                                                                                {unit_name: req.body.unit},
                                                                                                                {
                                                                                                                    $push: {
                                                                                                                        employee_ids: Employee_ID
                                                                                                                    }
                                                                                                                },
                                                                                                                (error, unit) => {
                                                                                                                    if(error) throw error;
                                                                                                                    else {
                                                                                                                        Enrollment.findOneAndUpdate(
                                                                                                                            {_id: Employee_ID},
                                                                                                                            {
                                                                                                                                first_name: req.body.first_name,
                                                                                                                                last_name: req.body.last_name,
                                                                                                                                phone_number: req.body.phone_number,
                                                                                                                                department: req.body.department,
                                                                                                                                unit: req.body.unit,
                                                                                                                                position: req.body.position,
                                                                                                                                grade: req.body.grade,
                                                                                                                                salary: Salary,
                                                                                                                                address: {
                                                                                                                                    state: req.body.address.state,
                                                                                                                                    city: req.body.address.city,
                                                                                                                                    street: req.body.address.street
                                                                                                                                }
                                                                                                                            },
                                                                                                                            (error, employee) => {
                                                                                                                                if(error) throw error;
                                                                                                                                else {
                                                                                                                                    Payroll.findOneAndUpdate(
                                                                                                                                        {employee_id: Employee_ID},
                                                                                                                                        {
                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                            annual_gross: Salary
                                                                                                                                        },
                                                                                                                                        (error, employeePayroll) => {
                                                                                                                                            if(error) throw error;
                                                                                                                                            else {
                                                                                                                                                Loans.findOneAndUpdate(
                                                                                                                                                    {employee_ID: Employee_ID},
                                                                                                                                                    {
                                                                                                                                                        first_name: req.body.first_name,
                                                                                                                                                        last_name: req.body.last_name,
                                                                                                                                                    },
                                                                                                                                                    (error, employee_loan) => {
                                                                                                                                                        if(error) throw error;
                                                                                                                                                        else {
                                                                                                                                                            Entry.findOneAndUpdate(
                                                                                                                                                                {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                {
                                                                                                                                                                    first_name: req.body.first_name,
                                                                                                                                                                    last_name: req.body.last_name,
                                                                                                                                                                },
                                                                                                                                                                (error, entry) => {
                                                                                                                                                                    if(error) throw error;
                                                                                                                                                                    else {
                                                                                                                                                                        Exit.findOneAndUpdate(
                                                                                                                                                                            {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                            {
                                                                                                                                                                                first_name: req.body.first_name,
                                                                                                                                                                                last_name: req.body.last_name,
                                                                                                                                                                            },
                                                                                                                                                                            (error, exit) => {
                                                                                                                                                                                if(error) throw error;
                                                                                                                                                                                else {
                                                                                                                                                                                    AttendanceHistory.updateMany(
                                                                                                                                                                                        {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                        {
                                                                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                                                                        },
                                                                                                                                                                                        (error, history) => {
                                                                                                                                                                                            if(error) throw error;
                                                                                                                                                                                            else {
                                                                                                                                                                                                WorkingHours.updateMany(
                                                                                                                                                                                                    {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                                    {
                                                                                                                                                                                                        first_name: req.body.first_name,
                                                                                                                                                                                                        last_name: req.body.last_name,
                                                                                                                                                                                                    },
                                                                                                                                                                                                    (error, working_hours) => {
                                                                                                                                                                                                        if(error) throw error;
                                                                                                                                                                                                        else {
                                                                                                                                                                                                            DailyPay.updateMany(
                                                                                                                                                                                                                {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                                                {
                                                                                                                                                                                                                    first_name: req.body.first_name,
                                                                                                                                                                                                                    last_name: req.body.last_name,
                                                                                                                                                                                                                    position: req.body.position,
                                                                                                                                                                                                                    grade: req.body.grade,
                                                                                                                                                                                                                    gross_salary: Salary
                                                                                                                                                                                                                },
                                                                                                                                                                                                                (error, dailypay) => {
                                                                                                                                                                                                                    if(error) throw error;
                                                                                                                                                                                                                    else {
                                                                                                                                                                                                                        res.status(200).json({"Message": "Employee updated"});
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            );
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                )
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    )
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        )
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            )
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                )
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    )
                                                                                                                                }
                                                                                                                            }
                                                                                                                        )
                                                                                                                    } 
                                                                                                                }
                                                                                                            )
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    // if departement is changed
                                                                                    Department.findOneAndUpdate(
                                                                                        {employee_ids: Employee_ID},
                                                                                        {
                                                                                            $pull: {
                                                                                                employee_ids: Employee_ID
                                                                                            }
                                                                                        },
                                                                                        (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                Department.findOneAndUpdate(
                                                                                                    {dept_name: req.body.department},
                                                                                                    {
                                                                                                        $push: {
                                                                                                            employee_ids: Employee_ID
                                                                                                        }
                                                                                                    },
                                                                                                    (error, unit) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            // if unit is also changed
                                                                                                            Unit.findOneAndUpdate(
                                                                                                                {employee_ids: Employee_ID},
                                                                                                                {
                                                                                                                    $pull: {
                                                                                                                        employee_ids: Employee_ID
                                                                                                                    }
                                                                                                                },
                                                                                                                (error, rs) => {
                                                                                                                    if(error) throw error;
                                                                                                                    else {
                                                                                                                        Unit.findOneAndUpdate(
                                                                                                                            {unit_name: req.body.unit},
                                                                                                                            {
                                                                                                                                $push: {
                                                                                                                                    employee_ids: Employee_ID
                                                                                                                                }
                                                                                                                            },
                                                                                                                            (error, unit) => {
                                                                                                                                if(error) throw error;
                                                                                                                                else {
                                                                                                                                    Enrollment.findOneAndUpdate(
                                                                                                                                        {_id: Employee_ID},
                                                                                                                                        {
                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                            phone_number: req.body.phone_number,
                                                                                                                                            department: req.body.department,
                                                                                                                                            unit: req.body.unit,
                                                                                                                                            position: req.body.position,
                                                                                                                                            grade: req.body.grade,
                                                                                                                                            salary: Salary,
                                                                                                                                            address: {
                                                                                                                                                state: req.body.address.state,
                                                                                                                                                city: req.body.address.city,
                                                                                                                                                street: req.body.address.street
                                                                                                                                            }
                                                                                                                                        },
                                                                                                                                        (error, employee) => {
                                                                                                                                            if(error) throw error;
                                                                                                                                            else {
                                                                                                                                                Payroll.findOneAndUpdate(
                                                                                                                                                    {employee_id: Employee_ID},
                                                                                                                                                    {
                                                                                                                                                        first_name: req.body.first_name,
                                                                                                                                                        last_name: req.body.last_name,
                                                                                                                                                        annual_gross: Salary
                                                                                                                                                    },
                                                                                                                                                    (error, employeePayroll) => {
                                                                                                                                                        if(error) throw error;
                                                                                                                                                        else {
                                                                                                                                                            Loans.findOneAndUpdate(
                                                                                                                                                                {employee_ID: Employee_ID},
                                                                                                                                                                {
                                                                                                                                                                    first_name: req.body.first_name,
                                                                                                                                                                    last_name: req.body.last_name,
                                                                                                                                                                },
                                                                                                                                                                (error, employee_loan) => {
                                                                                                                                                                    if(error) throw error;
                                                                                                                                                                    else {
                                                                                                                                                                        Entry.findOneAndUpdate(
                                                                                                                                                                            {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                            {
                                                                                                                                                                                first_name: req.body.first_name,
                                                                                                                                                                                last_name: req.body.last_name,
                                                                                                                                                                            },
                                                                                                                                                                            (error, entry) => {
                                                                                                                                                                                if(error) throw error;
                                                                                                                                                                                else {
                                                                                                                                                                                    Exit.findOneAndUpdate(
                                                                                                                                                                                        {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                        {
                                                                                                                                                                                            first_name: req.body.first_name,
                                                                                                                                                                                            last_name: req.body.last_name,
                                                                                                                                                                                        },
                                                                                                                                                                                        (error, exit) => {
                                                                                                                                                                                            if(error) throw error;
                                                                                                                                                                                            else {
                                                                                                                                                                                                AttendanceHistory.updateMany(
                                                                                                                                                                                                    {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                                    {
                                                                                                                                                                                                        first_name: req.body.first_name,
                                                                                                                                                                                                        last_name: req.body.last_name,
                                                                                                                                                                                                    },
                                                                                                                                                                                                    (error, history) => {
                                                                                                                                                                                                        if(error) throw error;
                                                                                                                                                                                                        else {
                                                                                                                                                                                                            WorkingHours.updateMany(
                                                                                                                                                                                                                {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                                                {
                                                                                                                                                                                                                    first_name: req.body.first_name,
                                                                                                                                                                                                                    last_name: req.body.last_name,
                                                                                                                                                                                                                },
                                                                                                                                                                                                                (error, working_hours) => {
                                                                                                                                                                                                                    if(error) throw error;
                                                                                                                                                                                                                    else {
                                                                                                                                                                                                                        DailyPay.updateMany(
                                                                                                                                                                                                                            {email: EMAIL, staff_ID: STAFF_ID},
                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                first_name: req.body.first_name,
                                                                                                                                                                                                                                last_name: req.body.last_name,
                                                                                                                                                                                                                                position: req.body.position,
                                                                                                                                                                                                                                grade: req.body.grade,
                                                                                                                                                                                                                                gross_salary: Salary
                                                                                                                                                                                                                            },
                                                                                                                                                                                                                            (error, dailypay) => {
                                                                                                                                                                                                                                if(error) throw error;
                                                                                                                                                                                                                                else {
                                                                                                                                                                                                                                    res.status(200).json({"Message": "Employee updated"});
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        );
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            )
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                )
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    )
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        )
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            );
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                );
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    );
                                                                                                                                } 
                                                                                                                            }
                                                                                                                        );
                                                                                                                    }
                                                                                                                }
                                                                                                            );
                                                                                                        }
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }
                                                                        })
                                                                    } else {
                                                                        res.status(404).json({"Message": "Unit given is not under department given"});
                                                                    }
                                                                }
                                                            })
                                                        } else {
                                                            res.status(404).json({"Message": "Unit given does not exist"});
                                                        }
                                                    }
                                                })
                                            } else {
                                                res.status(404).json({"Message": "Department given does not exist"});
                                            }
                                        }
                                    })
                                }
                            }
                        }
                    )
                } else {
                    res.status(404).json({"Message": "Employee not found"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const unenroll = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.findOne({_id: Employee_ID, status: "Active"}, (error, employee) => {
            if(error) throw error;
            else {
                if(employee) {
                    const HOD_FIRST_NAME = employee.first_name;
                    const HOD_LAST_NAME = employee.last_name;
                    const HOD_EMAIL = employee.email;

                    const Employee_qrcode = employee.qrcode;
                    Enrollment.findOneAndUpdate(
                        {_id: Employee_ID}, 
                        {
                            status: "Not Active",
                            $unset: {
                                qrcode: Employee_qrcode
                            }
                        },
                        (error, employee_updated) => {
                            if(error) throw error;
                            else {
                                Payroll.findOneAndDelete({employee_id: Employee_ID}, (error, emp_paroll) => {
                                    if(error) throw error;
                                    else {
                                        if(emp_paroll) {
                                            Department.findOneAndUpdate(
                                                {employee_ids: Employee_ID}, 
                                                {
                                                    $pull: {
                                                        employee_ids: Employee_ID
                                                    }
                                                },
                                                (error, rs) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(rs) {
                                                            // console.log("Delete employee_ids");
                                                            Unit.findOneAndUpdate(
                                                                {employee_ids: Employee_ID}, 
                                                                {
                                                                    $pull: {
                                                                        employee_ids: Employee_ID
                                                                    }
                                                                },
                                                                async (error, rs) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                        res.status(200).json({"Message": "Employee has been terminated"});
                                                                    }
                                                                }
                                                            )
                                                        } else {
                                                            // console.log("Delete hod_id");
                                                            Department.findOneAndUpdate(
                                                                {"dept_HOD.hod_id": Employee_ID},
                                                                {
                                                                    $unset: {
                                                                        dept_HOD: {
                                                                            hod_id: Employee_ID,
                                                                            hod_first_name: HOD_FIRST_NAME,
                                                                            hod_last_name: HOD_LAST_NAME,
                                                                            hod_email: HOD_EMAIL
                                                                        }
                                                                    }
                                                                },
                                                                (error, rs) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        Hod.findOneAndDelete(
                                                                            {employee_id: Employee_ID}, 
                                                                            async (error, rs) => {
                                                                                if(error) throw error;
                                                                                else {
                                                                                    await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                                    res.status(200).json({"Message": "Employee has been terminated"});
                                                                                }
                                                                            }
                                                                        )
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }
                                                }
                                            )
                                            // res.status(200).json({"Message": "Employee has payroll"});
                                        } else {
                                            res.status(404).json({"Message": "Employee has been terminated"});
                                        }
                                    }
                                });
                                // res.status(200).json({"Message": "Employee's account is no longer active"});
                            }
                        }
                    )
                } else {
                    res.status(404).json({"Message": "Employee not found"});
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
    getSingleEmployee,
    edit_employee,
    unenroll
};