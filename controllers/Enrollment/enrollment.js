const Enrollment = require("../../models/Enrollment/enrollment");
const Department = require("../../models/Department/department");
const Hod = require("../../models/Department/hod");
const Unit = require("../../models/Department/unit"); 
const Loans = require("../../models/Loans/loans");
const Payroll = require("../../models/Payroll/payroll");
// const AttendanceHistory = require("../../models/Attendance/attendanceHistory");
const Entry = require("../../models/Attendance/entry");
const Exit = require("../../models/Attendance/exit");
const WorkingHours = require("../../models/Attendance/working_hours");
const DailyPay = require("../../models/Daily_Pay/daily_pay");
const Leave = require("../../models/Leave/leave");
const qrcode = require("qrcode");

const enrollEmployee = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.staff_ID) {
        emptyFields.push("staff_ID");
    } if (!req.body.first_name) {
        emptyFields.push("first_name");
    } if(!req.body.last_name) {
        emptyFields.push("last_name");
    } if(!req.body.email) {
        emptyFields.push("emp_email");
    } if(!req.body.date_of_birth) {
        emptyFields.push("date_of_birth");
    } if(!req.body.phone_number) {
        emptyFields.push("phone_number");
    } if(!req.body.department) {
        emptyFields.push("department");
    } if(!req.body.unit) {
        emptyFields.push("unit");
    } if(!req.body.position) {
        emptyFields.push("position");
    } if(!req.body.grade) {
        emptyFields.push("grade");
    } if(!req.body.enrollment_date) {
        emptyFields.push("enrollment_date");
    } if(!req.body.employee_type) {
        emptyFields.push("employee_type");
    } if(!req.body.address.state) {
        emptyFields.push("state");
    } if(!req.body.address.city) {
        emptyFields.push("city");
    } if(!req.body.address.street) {
        emptyFields.push("street");
    } 
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate fields", emptyFields})
    } else {
        const double_space = /\s\s/
        const correct_email = /^[\w.+\-]+@gmail\.com$/
        const correct_language = /^[a-zA-Z0-9]+(\s+[a-zA-Z0-9]+)*$/
    
        if(correct_email.test(req.body.email)) {
            if(double_space.test(req.body.address.street)) {
                res.status(400).json({"Message": "Invalid whitespace at street"})
            } else if(correct_language.test(req.body.address.street)) {
                if(req.body.position === "1") {
                    if(req.body.grade === "1") {
                        var Salary = 20000
                    } else if(req.body.grade === "2") {
                        var Salary = 25000
                    } else if(req.body.grade === "3") {
                        var Salary = 30000
                    }
                } else if(req.body.position === "2") {
                    if(req.body.grade === "1") {
                        var Salary = 500000
                    } else if(req.body.grade === "2") {
                        var Salary = 700000
                    } else if(req.body.grade === "3") {
                        var Salary = 900000
                    }
                } else if(req.body.position === "3") {
                    if(req.body.grade === "1") {
                        var Salary = 1750000
                    } else if(req.body.grade === "2") {
                        var Salary = 3250000
                    } else if(req.body.grade === "3") {
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
                            grade: req.body.grade, employee_type: req.body.employee_type, enrollment_date: req.body.enrollment_date, 
                            gross_salary: Salary,
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
                                        res.status(400).json({"Message": "Staff ID already exist"});
                                    } else {
                                        Enrollment.findOne({email: req.body.email}, (error, rs) => {
                                            if(error) throw error;
                                            else {
                                                if(rs) {
                                                    res.status(400).json({"Message": "Email or Phone Number already exist"});
                                                } else {
                                                    // console.log(req.body.address.state);
                                                    Enrollment.findOne({phone_number: req.body.phone_number}, (error, rs) => {
                                                        if(error) throw error;
                                                        else {
                                                            if(rs) {
                                                                res.status(400).json({"Message": "Phone Number or Email already exist"});
                                                            } else {
                                                                Department.findOne({dept_name: req.body.department}, (error, department) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(department) {
                                                                            Unit.findOne({"unit.unit_name": req.body.unit}, (error, unit) => {
                                                                                if(error) throw error;
                                                                                else {
                                                                                    if(unit) {
                                                                                        // checking if the unit given is under the department given
                                                                                        Unit.find({"unit.unit_name": req.body.unit},{"dept.dept_id": 1, _id: 0}, (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                if(rs.length > 0) {
                                                                                                    const Department_ID = rs[0].dept.dept_id;
                                                                                                    // console.log(Department_ID);
                                                                                                    Department.findOne({_id: Department_ID, dept_name: req.body.department}, async (error, rs) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            if(rs) {
                                                                                                                const enrolledEmployee = await newEmployee.save();
                                                                                                                try {
                                                                                                                    const employeePayroll = new Payroll({
                                                                                                                        staff_ID: req.body.staff_ID, first_name: req.body.first_name, last_name: req.body.last_name,
                                                                                                                        email: req.body.email, employee_type: req.body.employee_type, 
                                                                                                                        enrollment_date: req.body.enrollment_date, employee_id: newEmployee._id, 
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
                                                                                                                                if(dept_updated) {
                                                                                                                                    Unit.findOneAndUpdate(
                                                                                                                                        {"unit.unit_name": req.body.unit},
                                                                                                                                        {
                                                                                                                                            $push: {
                                                                                                                                                "unit.$.employee_ids": enrolledEmployee._id
                                                                                                                                            }
                                                                                                                                        }, 
                                                                                                                                        (error, unit_updated) => {
                                                                                                                                            if(error) throw error
                                                                                                                                            else {
                                                                                                                                                if(unit_updated) {
                                                                                                                                                    res.status(200).json({"Message": "Employee enrolled successfully", enrolledEmployee});
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    )
                                                                                                                                }
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
                                                                                                                res.status(400).json({"Message": "Unit is not under department"});
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
                                                    })
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
            } else {
                res.status(400).json({"Message": "Whitespace at the begining or end of street field"})
            }
        } else {
            res.status(400).json({"Message": "Email should end with @gmail.com"})
        }


    }
}

const getEmployees = async (req, res, next) => {
    try {
        Enrollment.find({}, (error, result) => {
            if(error) throw error;
            else {
                if(result.length > 0) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({"Message": "No employees enrolled", result});
                }
            }
        }).sort({createdAt: -1})
    } catch (error) {
        next(error);
    }
}

const getSingleEmployee = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.findOne({_id: Employee_ID}, {qrcode: 0},(error, single_employee) => {
            if(error) throw error;
            else {
                if(single_employee) {
                    const Employee_Email = single_employee.email;
                    const Employment_Type = single_employee.employee_type;
                    Leave.aggregate([
                        {
                            $match: {
                            email: Employee_Email
                            }
                        },
                        {
                            $group: {
                                _id: "$email",
                                total_leave_pay: {
                                    $sum: "$leave_pay"
                                }
                            }
                        }
                    ], (error, leave) => {
                        if(error) throw error;
                        else {
                            let leave_pay = parseFloat((((leave[0]?.total_leave_pay)?.toFixed(2))?.toLocaleString())?.replace(/,/g,''));
                            let leave_pay_formatted = (leave_pay)?.toLocaleString();
                            WorkingHours.aggregate([
                                {
                                    $match: {
                                        email: Employee_Email
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$email",
                                        total_hours: {
                                            $sum: "$hours.worked_hours"
                                        },
                                        total_extra_hours: {
                                            $sum: "$hours.extra_hours"
                                        },
                                        days_worked: {
                                            $sum: 1
                                        }  
                                    }
                                }
                            ], (error, employee) => {
                                if(error) throw error;
                                else {
                                    let total_hours_worked = employee[0]?.total_hours;
                                    let total_worked_days = employee[0]?.days_worked;
                                    let total_overtime_hours = employee[0]?.total_extra_hours;
                                    DailyPay.aggregate([
                                        {
                                            $match: {
                                                email: Employee_Email
                                            }
                                        },
                                        {
                                            $group: {
                                                _id: "$email",
                                                total_netsalary: {
                                                    $sum: "$net_salary.netsalary"
                                                }
                                            }
                                        }
                                    ], (error, rs) => {
                                        if(error) throw error;
                                        else {
                                            let Net_Salary = parseFloat((((rs[0]?.total_netsalary)?.toFixed(2))?.toLocaleString())?.replace(/,/g,''));
                                            let Net_Salary_Formatted = (Net_Salary)?.toLocaleString();
                                            Loans.findOne({email: Employee_Email}, (error, loan) => {
                                                if(error) throw error;
                                                else {
                                                    let loanpay = parseFloat((((loan?.loan_amount)?.toFixed(2))?.toLocaleString())?.replace(/,/g,''));
                                                    let loanpay_formatted = (loanpay)?.toLocaleString();
                                                    Employment_Type === "Full-Time" ? 
                                                    res.status(200).json({
                                                        "employee_details": single_employee, 
                                                        "employee_leave_pay": leave_pay_formatted || 0,
                                                        "hours_worked": total_hours_worked || 0,
                                                        "days_worked": total_worked_days || 0,
                                                        "loan": loanpay_formatted || 0,
                                                        "overtime": total_overtime_hours || 0,
                                                        "net": Net_Salary_Formatted || 0
                                                    }) :
                                                    res.status(200).json({
                                                        "employee_details": single_employee, 
                                                        "employee_leave_pay": 0,
                                                        "hours_worked": total_hours_worked || 0,
                                                        "days_worked": total_worked_days || 0,
                                                        "loan": 0,
                                                        "overtime": 0,
                                                        "net": Net_Salary_Formatted || 0
                                                    });
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
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
    let emptyFields = [];
    if(!req.body.phone_number) {
        emptyFields.push("phone_number");
    } 
    if(!req.body.position) {
        emptyFields.push("position")
    } 
    if(!req.body.grade) {
        emptyFields.push("grade")
    }

    if(emptyFields.length > 0) {
        return res.status(400).json({"Message": "Fill in the appropriate fields", emptyFields})
    } else {      
        if(req.body.position === "1") {
            if(req.body.grade === "1") {
                var Salary = 20000
            } else if(req.body.grade === "2") {
                var Salary = 25000
            } else if(req.body.grade === "3") {
                var Salary = 30000
            }
        } else if(req.body.position === "2") {
            if(req.body.grade === "1") {
                var Salary = 500000
            } else if(req.body.grade === "2") {
                var Salary = 700000
            } else if(req.body.grade === "3") {
                var Salary = 900000
            }
        } else if(req.body.position === "3") {
            if(req.body.grade === "1") {
                var Salary = 1750000
            } else if(req.body.grade === "2") {
                var Salary = 3250000
            } else if(req.body.grade === "3") {
                var Salary = 5000000
            }
        }
        const Employee_ID = req.params.employee_id;
        try {
            Enrollment.findById(Employee_ID, (error, employee) => {
                if(error) throw error;
                else {
                    if(employee) {
                        const Employee_Email = employee.email;
                        const Employment_Type = employee.employee_type;
                        const STAFF_ID = employee.staff_ID;
                        Enrollment.findOne({_id: Employee_ID,status: "Not Active"}, (error, rs) => {
                            if(error) throw error;
                            else {
                                if(rs) {
                                    res.status(400).json({"Message": "Cannot update terminated employee"});
                                } else {
                                    Enrollment.findOneAndUpdate(
                                        {_id: Employee_ID},
                                        {
                                            phone_number: req.body.phone_number,
                                            position: req.body.position,
                                            grade: req.body.grade,
                                            gross_salary: Salary
                                        },
                                        {new: true},
                                        (error, employeeUpdated) => {
                                            if(error) throw error;
                                            else {
                                                Payroll.findOneAndUpdate(
                                                    {employee_id: Employee_ID},
                                                    {
                                                        annual_gross: Salary
                                                    },
                                                    (error, employee_payroll) => {
                                                        if(error) throw error;
                                                        else {
                                                            DailyPay.updateMany(
                                                                {email: Employee_Email, staff_ID: STAFF_ID},
                                                                {
                                                                    position: req.body.position,
                                                                    grade: req.body.grade,
                                                                    gross_salary: Salary
                                                                },
                                                                (error, dailypay) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        Leave.aggregate([
                                                                            {
                                                                                $match: {
                                                                                email: Employee_Email
                                                                                }
                                                                            },
                                                                            {
                                                                                $group: {
                                                                                    _id: "$email",
                                                                                    total_leave_pay: {
                                                                                        $sum: "$leave_pay"
                                                                                    }
                                                                                }
                                                                            }
                                                                        ], (error, leave) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                let leave_pay = parseFloat((((leave[0]?.total_leave_pay)?.toFixed(2))?.toLocaleString())?.replace(/,/g,''));
                                                                                let leave_pay_formatted = (leave_pay)?.toLocaleString();
                                                                                WorkingHours.aggregate([
                                                                                    {
                                                                                        $match: {
                                                                                            email: Employee_Email
                                                                                        }
                                                                                    },
                                                                                    {
                                                                                        $group: {
                                                                                            _id: "$email",
                                                                                            total_hours: {
                                                                                                $sum: "$hours.worked_hours"
                                                                                            },
                                                                                            total_extra_hours: {
                                                                                                $sum: "$hours.extra_hours"
                                                                                            },
                                                                                            days_worked: {
                                                                                                $sum: 1
                                                                                            }  
                                                                                        }
                                                                                    }
                                                                                ], (error, employee) => {
                                                                                    if(error) throw error;
                                                                                    else {
                                                                                        let total_hours_worked = employee[0]?.total_hours;
                                                                                        let total_worked_days = employee[0]?.days_worked;
                                                                                        let total_overtime_hours = employee[0]?.total_extra_hours;
                                                                                        DailyPay.aggregate([
                                                                                            {
                                                                                                $match: {
                                                                                                    email: Employee_Email
                                                                                                }
                                                                                            },
                                                                                            {
                                                                                                $group: {
                                                                                                    _id: "$email",
                                                                                                    total_netsalary: {
                                                                                                        $sum: "$net_salary.netsalary"
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        ], (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                let Net_Salary = parseFloat((((rs[0]?.total_netsalary)?.toFixed(2))?.toLocaleString())?.replace(/,/g,''));
                                                                                                let Net_Salary_Formatted = (Net_Salary)?.toLocaleString();
                                                                                                Loans.findOne({email: Employee_Email}, (error, loan) => {
                                                                                                    if(error) throw error;
                                                                                                    else {
                                                                                                        let loanpay = parseFloat((((loan?.loan_amount)?.toFixed(2))?.toLocaleString())?.replace(/,/g,''));
                                                                                                        let loanpay_formatted = (loanpay)?.toLocaleString();
                                                                                                        res.status(200).json({
                                                                                                            "Message": "Employee updated",
                                                                                                            "employee_details": employeeUpdated, 
                                                                                                            "employee_leave_pay": leave_pay_formatted || 0,
                                                                                                            "hours_worked": total_hours_worked || 0,
                                                                                                            "days_worked": total_worked_days || 0,
                                                                                                            "loan": loanpay_formatted || 0,
                                                                                                            "overtime": total_overtime_hours || 0,
                                                                                                            "net": Net_Salary_Formatted || 0
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
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
                        })
                    } else {
                        res.status(404).json({"Message": "Employee not found"});
                    }
                }
            })
        } catch (error) {
            next(error);
        }
    }

}

const unenroll = async (req, res, next) => {
    const Employee_ID = req.params.employee_id;
    try {
        Enrollment.findOne({
            $or: [
                {_id: Employee_ID, status: "Active"},
                {_id: Employee_ID, status: "On Leave"}
            ]
        }, (error, employee) => {
            if(error) throw error;
            else {
                if(employee) {
                    const FIRST_NAME = employee.first_name;
                    const LAST_NAME = employee.last_name;
                    const EMAIL = employee.email;
                    const Employee_qrcode = employee.qrcode;

                    Enrollment.findOneAndUpdate(
                        {_id: Employee_ID}, 
                        {
                            status: "Terminated",
                            $unset: {
                                qrcode: Employee_qrcode
                            }
                        },
                        (error, employee_updated) => {
                            if(error) throw error;
                            else {
                                if(employee_updated) {
                                    Payroll.findOneAndDelete({employee_id: Employee_ID}, (error, emp_paroll) => {
                                        if(error) throw error;
                                        else {
                                            if(emp_paroll) {
                                                Hod.findOne({employee_id: Employee_ID}, (error, rs) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(rs) {
                                                            Enrollment.findOne({_id: Employee_ID, unit: "N/A"}, (error, rs) => {
                                                                if(error) throw error;
                                                                else {
                                                                    if(rs) {
                                                                        Hod.findOneAndDelete({employee_id: Employee_ID}, (error, rs) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                if(rs) {
                                                                                    Department.findOneAndUpdate({employee_ids: Employee_ID}, 
                                                                                        {
                                                                                            $pull: {
                                                                                                employee_ids: Employee_ID
                                                                                            }
                                                                                        },
                                                                                        (error, rs) => {
                                                                                        if(error) throw error;
                                                                                        else {
                                                                                            if(rs) {
                                                                                                Department.findOneAndUpdate({"dept_HOD.hod_id": Employee_ID},
                                                                                                    {
                                                                                                        $unset: {
                                                                                                            dept_HOD: {
                                                                                                                hod_id: Employee_ID,
                                                                                                                hod_first_name: FIRST_NAME,
                                                                                                                hod_last_name: LAST_NAME,
                                                                                                                hod_email: EMAIL
                                                                                                            }
                                                                                                        }
                                                                                                    },
                                                                                                    async (error, rs) => {
                                                                                                        if(error) throw error;
                                                                                                        else {
                                                                                                            if(rs) {
                                                                                                                await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                                                                await Entry.deleteMany({email: EMAIL})
                                                                                                                await Exit.deleteMany({email: EMAIL})
                                                                                                                res.status(200).json({"Message": "Employee has been terminated"});
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                )
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            }
                                                                        })
                                                                    } else {
                                                                        Hod.findOneAndDelete({employee_id: Employee_ID}, (error, rs) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                if(rs) {
                                                                                    Department.findOneAndUpdate({employee_ids: Employee_ID}, 
                                                                                        {
                                                                                            $pull: {
                                                                                                employee_ids: Employee_ID
                                                                                            }
                                                                                        },
                                                                                        (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                if(rs) {
                                                                                                    Unit.findOneAndUpdate({"unit.employee_ids": Employee_ID},
                                                                                                        {
                                                                                                            $pull: {
                                                                                                                "unit.$.employee_ids": Employee_ID
                                                                                                            }
                                                                                                        },
                                                                                                        (error, rs) => {
                                                                                                            if(error) throw error;
                                                                                                            else {
                                                                                                                if(rs) {
                                                                                                                    Department.findOneAndUpdate({"dept_HOD.hod_id": Employee_ID},
                                                                                                                        {
                                                                                                                            $unset: {
                                                                                                                                dept_HOD: {
                                                                                                                                    hod_id: Employee_ID,
                                                                                                                                    hod_first_name: FIRST_NAME,
                                                                                                                                    hod_last_name: LAST_NAME,
                                                                                                                                    hod_email: EMAIL
                                                                                                                                }
                                                                                                                            }
                                                                                                                        },
                                                                                                                        async (error, rs) => {
                                                                                                                            if(error) throw error;
                                                                                                                            else {
                                                                                                                                if(rs) {
                                                                                                                                    await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                                                                                    await Entry.deleteMany({email: EMAIL})
                                                                                                                                    await Exit.deleteMany({email: EMAIL})
                                                                                                                                    res.status(200).json({"Message": "Employee has been terminated"});
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    )
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    )
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    )
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        } else {
                                                            // not hod
                                                            Enrollment.findOne({_id: Employee_ID, department: "N/A"}, async (error, rs) => {
                                                                if(error) throw error;
                                                                else {
                                                                    if(rs) {
                                                                        await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                        await Entry.deleteMany({email: EMAIL})
                                                                        await Exit.deleteMany({email: EMAIL})
                                                                        res.status(200).json({"Message": "Employee has been terminated"});
                                                                    } else {
                                                                        Enrollment.findOne({_id: Employee_ID, unit: "N/A"}, (error, rs) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                if(rs) {
                                                                                    Department.findOneAndUpdate({employee_ids: Employee_ID}, 
                                                                                        {
                                                                                            $pull: {
                                                                                                employee_ids: Employee_ID
                                                                                            }
                                                                                        },
                                                                                        async (error, rs) => {
                                                                                        if(error) throw error;
                                                                                        else {
                                                                                            if(rs) {
                                                                                                await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                                                await Entry.deleteMany({email: EMAIL})
                                                                                                await Exit.deleteMany({email: EMAIL})
                                                                                                res.status(200).json({"Message": "Employee has been terminated"});
                                                                                            }
                                                                                        }
                                                                                    })
                                                                                } else {
                                                                                    Department.findOneAndUpdate({employee_ids: Employee_ID}, 
                                                                                        {
                                                                                            $pull: {
                                                                                                employee_ids: Employee_ID
                                                                                            }
                                                                                        },
                                                                                        (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                if(rs) {
                                                                                                    Unit.findOneAndUpdate({"unit.employee_ids": Employee_ID},
                                                                                                        {
                                                                                                            $pull: {
                                                                                                                "unit.$.employee_ids": Employee_ID
                                                                                                            }
                                                                                                        },
                                                                                                        async (error, rs) => {
                                                                                                            if(error) throw error;
                                                                                                            else {
                                                                                                                if(rs) {
                                                                                                                    await DailyPay.deleteMany({employee_ID: Employee_ID})
                                                                                                                    await Entry.deleteMany({email: EMAIL})
                                                                                                                    await Exit.deleteMany({email: EMAIL})
                                                                                                                    res.status(200).json({"Message": "Employee has been terminated"});
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    )
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    )
                                                                                }
                                                                            }
                                                                        })
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            } else {
                                                res.status(404).json({"Message": "Employee has been terminated"});
                                            }
                                        }
                                    });
                                    // res.status(200).json({"Message": "Employee's account is no longer active"});
                                }
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