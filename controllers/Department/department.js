const Department = require("../../models/Department/department");
const Unit = require("../../models/Department/unit");
const Hod = require("../../models/Department/hod");
const WorkingHours = require("../../models/Attendance/working_hours");
const DailyPay = require("../../models/Daily_Pay/daily_pay");
const Leave = require("../../models/Leave/leave");
const Loans = require("../../models/Loans/loans");
const Enrollment = require("../../models/Enrollment/enrollment");

const getAllDepartments = async (req, res, next) => {
    try {
        Department.find({}, (error, dept) => {
            if(error) throw error;
            else {
                if(dept.length > 0) {
                    res.status(200).json(dept);
                } else {
                    res.status(404).json({dept});
                }
            }
        }).sort({createdAt: -1})
    } catch (error) {
        next(error);
    }
}

const getSingledepartmentUnit = async (req, res, next) => {
    const { dept_name } = req.query;
    try {
        Department.find({}, (err, dept) => {
            if(err) throw err;
            else {
                if(dept.length > 0) {
                    Department.find({dept_name: dept_name}, (error, result) => {
                        if(error) throw error;
                        else {
                            if(result.length > 0) {
                                Unit.find({"dept.dept_name": dept_name}, (error, unit) => {
                                    if(error) throw error;
                                    else {
                                        if(unit.length > 0) {
                                            const units = unit;
                                            res.status(200).json({dept, units});
                                        }
                                    }
                                })
                            } else {
                                res.status(200).json({dept});
                            }
                        }
                    })
                } else {
                    res.status(404).json({dept});
                }
            }
        })
        
        
    } catch (error) {
        next(error);
    }
}

const getSingledepartment = async (req, res, next) => {
    const { dept_name } = req.query;
    try {
        Department.findOne({dept_name: dept_name}, (error, departments) => {
            if(error) throw error;
            else {
                if(departments) {
                    const Employee_Ids = departments.employee_ids
                    Enrollment.find({_id:Employee_Ids}, {qrcode: 0} ,(error, employees) => {
                        if(error) throw error;
                        else {
                            if(employees.length > 0) {
                                res.status(200).json({departments, employees});
                            } else {
                                res.status(400).json({departments, employees});
                            }
                        }
                    })
                } else {
                    res.status(400).json(departments);
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const createDepartment = async (req, res, next) => {
    let emptyFields = [];
    let mapped_unit = req.body.unit.map((unit) => unit.unit_name)
    let filter = mapped_unit.filter((unit) => unit === "")
    if(!req.body.dept_name) {
        emptyFields.push("dept_name");
    } if(filter.length > 0) {
        emptyFields.push("unit_name");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field(s)", emptyFields})
    } else {
        const name_unit = req.body.unit.map((unit) => (unit.unit_name))

        if(name_unit.includes(req.body.dept_name)) {
            res.status(400).json({"Message": "Department name matches a unit name field"})
        } else if(name_unit.length !== new Set(name_unit).size){
            res.status(400).json({"Message": "Unit name fields are matching"})
        } else {
            const double_space = /\s\s/
            const correct_language = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/
            if(double_space.test(req.body.dept_name)) {
                res.status(400).json({"Message": "Invalid spacing at department name"})
            } else if(correct_language.test(req.body.dept_name)) {
                if(req.body.unit.length > 0) {
                    let Invalid_unit_name = /\s\s/g
                    let Unit_Name = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/g
                    let Invalid_unit_name_match = req.body.unit.map((unit) => unit.unit_name.match(Invalid_unit_name));
                    let unit_name_match = req.body.unit.map((unit) => (unit.unit_name.match(Unit_Name)));
                    
                    if((unit_name_match.filter((unit) => unit === null)).length > 0 || (Invalid_unit_name_match.filter((unit) => unit !== null)).length > 0) {
                        res.status(400).json({"Message": "Invalid spacing at unit name"})
                    } else {
                        Department.findOne({dept_name: req.body.dept_name}, (error, dept) => {
                            if(error) throw error;
                            else {
                                if(dept) {
                                    res.status(400).json({"Message": "Department name already exists"});
                                } else {
                                    Unit.findOne({unit_name: req.body.dept_name}, (error, unit) => {
                                        if(error) throw error;
                                        else {
                                            if(unit) {
                                                res.status(400).json({"Message": "Department name matches an existing unit"});
                                            } else {
                                                Department.findOne(
                                                    {
                                                        dept_name: req.body.unit.map((unit) => (
                                                            unit.unit_name
                                                        ))
                                                    },
                                                    (error, dept) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(dept) {
                                                            res.status(400).json({"Message": "Unit name matches an existing department"});
                                                        } else {
                                                            Unit.findOne(
                                                                {
                                                                    unit_name: req.body.unit.map((unit) => (
                                                                        unit.unit_name
                                                                    ))
                                                                },
                                                                async (error, unit) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(unit) {
                                                                            res.status(400).json({"Message": "Unit name already exists"});
                                                                        } else {
                                                                            const newDepartment = new Department({
                                                                                dept_name: req.body.dept_name,
                                                                                unit: (req.body.unit).map((unit) => (
                                                                                    {
                                                                                        unit_name: unit.unit_name
                                                                                    }
                                                                                ))
                                                                            })
                                                                            const newUnit = new Unit({
                                                                                unit: req.body.unit.map((unit) => (
                                                                                    {
                                                                                        unit_name: unit.unit_name,
                                                                                        dept_name: newDepartment.dept_name
                                                                                    }
                                                                                )),
                                                                                dept: {
                                                                                    dept_id: newDepartment._id,
                                                                                    dept_name: newDepartment.dept_name
                                                                                }
                                                                            })
                                                                            await newUnit.save();
                                                                            const DepartmentSaved = await newDepartment.save();
                                                                            res.status(200).json({"Message": "Department created successfully",DepartmentSaved});
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
                    }
                } else {
                    res.status(400).json({"Message": "Add at least 1 unit"})
                }
            } else {
                res.status(400).json({"Message": "Invalid spacing at department name"})
            }
        }
    }
}

const updateDepartment = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.dept_name) {
        emptyFields.push("edit_dept_name");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field", emptyFields});
    } else {
        const double_space = /\s\s/
        const correct_language = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/
        if(double_space.test(req.body.dept_name)) {
            res.status(400).json({"Message": "Invalid department name"})
        } else if(correct_language.test(req.body.dept_name)){
            const Department_ID = req.params.dept_id;
            try {
                Department.find({_id: Department_ID}, (err, rs) => {
                    if(err) throw err;
                    else {
                        if(rs.length > 0) {
                            const Employee_ids = rs[0].employee_ids;
                            const Department_Name = rs[0].dept_name;
                            Department.findOne({dept_name: req.body.dept_name}, async (error, department) => {
                                if(error) throw error;
                                else {
                                    if(department) {
                                        res.status(400).json({"Message": "Department name already exists"});
                                    } else {
                                        Unit.findOne({"unit.unit_name": req.body.dept_name}, async (error, unit) =>{
                                            if(error) throw error;
                                            else {
                                                if(unit) {
                                                    res.status(400).json({"Message": "Department name matches an existing unit"});
                                                } else {
                                                    Department.findOneAndUpdate(
                                                        {_id: Department_ID},
                                                        {$set: req.body},
                                                        {new: true},
                                                        async (error, updated_department) => {
                                                        if(error) throw error;
                                                        else {
                                                            Hod.findOneAndUpdate(
                                                                {"department.dept_id": Department_ID}, 
                                                                {
                                                                    department: {
                                                                        dept_id: Department_ID,
                                                                        dept_name: req.body.dept_name
                                                                    }
                                                                },
                                                                {new: true},
                                                                (error, hod_dept_updated) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        Enrollment.updateMany({_id: Employee_ids},
                                                                            {
                                                                                department: req.body.dept_name
                                                                            },
                                                                            (error, rs) => {
                                                                                if(error) throw error
                                                                                else {
                                                                                    Unit.findOneAndUpdate(
                                                                                        // fields
                                                                                        {
                                                                                            "dept.dept_id": Department_ID,
                                                                                            "unit.dept_name": Department_Name
                                                                                        },
                                                                                        // what to update to
                                                                                        {
                                                                                            dept: {
                                                                                                dept_id: Department_ID,
                                                                                                dept_name: req.body.dept_name
                                                                                            },
                                                                                            $set: {
                                                                                                "unit.$[field].dept_name": req.body.dept_name
                                                                                            }
                                                                                        },
                                                                                        // condition
                                                                                        {
                                                                                            arrayFilters: [{"field.dept_name": Department_Name}]
                                                                                        },
                                                                                        (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                if(rs) {
                                                                                                    res.status(200).json({"Message": "Department name updated successfully",updated_department});
                                                                                                }
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
                                                    });
                                                }
                                            }
                                        })
                                    }
                                }
                            })

                        } else {
                            res.status(404).json({"Message": "Department does not exist"});
                        }
                    }
                })
            } catch (error) {
                next(error);
            }
        } else {
            res.status(400).json({"Message": "Whitespace at the begining or end not acceptable"})
        }
    }
}

const deleteDepartment = async (req, res, next) => {
   const Department_ID = req.params.dept_id;
   try {
        Department.find({_id: Department_ID}, async (err, rs) => {
            if(err) throw err;
            else {
                if(rs.length > 0) {
                    const Employee_ids = rs[0].employee_ids;
                    const Department_Name = rs[0].dept_name;
                    Hod.findOneAndDelete({"department.dept_id": Department_ID}, async (error, hod_deleted) =>{
                        if(error) throw error;
                        else {          
                            await Unit.deleteMany({"dept.dept_id": Department_ID});
                            try {           
                                Enrollment.updateMany({_id: Employee_ids},
                                    {
                                        department: "N/A",
                                        unit: "N/A"
                                    },
                                    async (error, rs) => {
                                        if(error) throw error
                                        else {
                                            if(rs) {
                                                const deleted_depts = await Department.findByIdAndDelete(Department_ID);
                                                res.status(200).json({"Message": "Department deleted successfully",deleted_depts});
                                            }
                                            }
                                    }
                                )
                            } catch(error) {
                                next(error);
                            }
                        }
                    })
                } else {
                    res.status(404).json({"Message": "Department trying to be deleted does not exist"});
                }
            }
        })
   } catch (error) {
        next(error);
   }
}

const transfer = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.staff_ID) {
        emptyFields.push("staff_ID");
    } 
    if(!req.body.dept_name) {
        emptyFields.push("dept_name")
    }
    if(!req.body.unit_name) {
        emptyFields.push("unit_name");
    }

    if(emptyFields.length > 0) {
        return res.status(400).json({"Message": "Fill in the appropriate fields", emptyFields});
    } else {
        Enrollment.findOne({staff_ID: req.body.staff_ID}, (error, emp) => {
            if(error) throw error;
            else {
                if(emp) {
                    const Employee_ID = emp._id;
                    const Employee_Email = emp.email;
                    const STAFF_ID = emp.staff_ID;
                    Hod.findOne({hod_email: Employee_Email}, (error, hod) => {
                        if(error) throw error
                        else {
                            if(hod) {
                                return res.status(400).json({"Message": "Cannot transfer hod"})
                            } else {
                                Department.findOne({dept_name: req.body.dept_name}, (error, rs) => {
                                    if(error) throw error;
                                    else {
                                        if(rs) {
                                            const Department_ID = rs._id
                                            Unit.findOne({"unit.unit_name": req.body.unit_name},
                                            {
                                                unit: {
                                                    $elemMatch: {
                                                        unit_name: req.body.unit_name
                                                    }
                                                }
                                            },
                                            (error, unit) => {
                                                if(error) throw error;
                                                else {
                                                    if(unit) {
                                                        const UNIT_NAME = unit.unit[0].unit_name;
                                                        const DEPARTMENT_NAME = unit.unit[0].dept_name;
                                                        Department.findOne({_id: Department_ID, "unit.unit_name": UNIT_NAME}, (error, dept) => {
                                                            if(error) throw error;
                                                            else {
                                                                if(dept) {
                                                                    Unit.findOne({
                                                                        unit: {
                                                                            $elemMatch: {
                                                                                employee_ids: Employee_ID,
                                                                                unit_name: UNIT_NAME
                                                                            }
                                                                        }
                                                                    }, (error, same_unit) => {
                                                                        if(error) throw error;
                                                                        else {
                                                                            if(same_unit) {
                                                                                res.status(400).json({"Message": "Employee is already under unit"})
                                                                            } else {
                                                                                Enrollment.findOne({_id: Employee_ID, department: "N/A"}, (error, rs) => {
                                                                                    if(error) throw error;
                                                                                    else {
                                                                                        if(rs) {
                                                                                            Department.findOneAndUpdate({dept_name: DEPARTMENT_NAME},
                                                                                                {
                                                                                                    $push: {
                                                                                                        employee_ids: Employee_ID
                                                                                                    }
                                                                                                },
                                                                                                (error, updated_dept) => {
                                                                                                    if(error) throw error;
                                                                                                    else {
                                                                                                        if(updated_dept) {
                                                                                                            Unit.findOneAndUpdate({"unit.unit_name": UNIT_NAME}, 
                                                                                                                {
                                                                                                                    $push: {
                                                                                                                        "unit.$.employee_ids": Employee_ID
                                                                                                                    }
                                                                                                                },
                                                                                                                (error, new_unit) => {
                                                                                                                    if(error) throw error;
                                                                                                                    else {
                                                                                                                        if(new_unit) {
                                                                                                                            Enrollment.findOneAndUpdate({_id: Employee_ID}, 
                                                                                                                                {
                                                                                                                                    department: DEPARTMENT_NAME,
                                                                                                                                    unit: UNIT_NAME
                                                                                                                                },
                                                                                                                                {new: true},
                                                                                                                                (error, employeeTransfered) => {
                                                                                                                                if(error) throw error;
                                                                                                                                else {
                                                                                                                                    if(employeeTransfered) {
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
                                                                                                                                                                            "Message": "Successfully transfered employee",
                                                                                                                                                                            "employee_details": employeeTransfered, 
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
                                                                                                                            })
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            )
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            )
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
                                                                                                            (error, updated_dept) => {
                                                                                                                if(error) throw error;
                                                                                                                else {
                                                                                                                    if(updated_dept) {
                                                                                                                        Department.findOneAndUpdate({dept_name: DEPARTMENT_NAME},
                                                                                                                            {
                                                                                                                                $push: {
                                                                                                                                    employee_ids: Employee_ID
                                                                                                                                }
                                                                                                                            },
                                                                                                                            (error, new_dept) => {
                                                                                                                                if(error) throw error;
                                                                                                                                else {
                                                                                                                                    if(new_dept) {
                                                                                                                                        Unit.findOneAndUpdate({"unit.unit_name": UNIT_NAME}, 
                                                                                                                                            {
                                                                                                                                                $push: {
                                                                                                                                                    "unit.$.employee_ids": Employee_ID
                                                                                                                                                }
                                                                                                                                            },
                                                                                                                                            (error, new_unit) => {
                                                                                                                                                if(error) throw error;
                                                                                                                                                else {
                                                                                                                                                    if(new_unit) {
                                                                                                                                                        Enrollment.findOneAndUpdate({_id: Employee_ID}, 
                                                                                                                                                            {
                                                                                                                                                                department: DEPARTMENT_NAME,
                                                                                                                                                                unit: UNIT_NAME
                                                                                                                                                            },
                                                                                                                                                            {new: true},
                                                                                                                                                            (error, employeeTransfered) => {
                                                                                                                                                            if(error) throw error;
                                                                                                                                                            else {
                                                                                                                                                                if(employeeTransfered) {
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
                                                                                                                                                                                                        "Message": "Successfully transfered employee",
                                                                                                                                                                                                        "employee_details": employeeTransfered, 
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
                                                                                                                                                        })
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
                                                                                                    } else {
                                                                                                        Department.findOneAndUpdate({employee_ids: Employee_ID},
                                                                                                            {
                                                                                                                $pull: {
                                                                                                                    employee_ids: Employee_ID
                                                                                                                }
                                                                                                            },
                                                                                                            (error, updated_dept) => {
                                                                                                            if(error) throw error;
                                                                                                            else {
                                                                                                                if(updated_dept) {
                                                                                                                    Department.findOneAndUpdate({dept_name: DEPARTMENT_NAME}, 
                                                                                                                        {
                                                                                                                            $push: {
                                                                                                                                employee_ids: Employee_ID
                                                                                                                            }
                                                                                                                        },
                                                                                                                        (error, new_dept) => {
                                                                                                                        if(error) throw error;
                                                                                                                        else {
                                                                                                                            if(new_dept) {
                                                                                                                                Unit.findOneAndUpdate({"unit.employee_ids": Employee_ID}, 
                                                                                                                                    {
                                                                                                                                        $pull: {
                                                                                                                                            "unit.$.employee_ids": Employee_ID
                                                                                                                                        }
                                                                                                                                    },
                                                                                                                                    (error, updated_unit) => {
                                                                                                                                    if(error) throw error;
                                                                                                                                    else {
                                                                                                                                        if(updated_unit) {
                                                                                                                                            Unit.findOneAndUpdate({"unit.unit_name": UNIT_NAME}, 
                                                                                                                                                {
                                                                                                                                                    $push: {
                                                                                                                                                        "unit.$.employee_ids": Employee_ID
                                                                                                                                                    }
                                                                                                                                                },
                                                                                                                                                (error, new_unit) => {
                                                                                                                                                if(error) throw error;
                                                                                                                                                else {
                                                                                                                                                    if(new_unit) {
                                                                                                                                                        Enrollment.findOneAndUpdate({_id: Employee_ID}, 
                                                                                                                                                            {
                                                                                                                                                                department: DEPARTMENT_NAME,
                                                                                                                                                                unit: UNIT_NAME
                                                                                                                                                            },
                                                                                                                                                            {new: true},
                                                                                                                                                            (error, employeeTransfered) => {
                                                                                                                                                            if(error) throw error;
                                                                                                                                                            else {
                                                                                                                                                                if(employeeTransfered) {
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
                                                                                                                                                                                                        "Message": "Successfully transfered employee",
                                                                                                                                                                                                        "employee_details": employeeTransfered, 
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
                                                                                                                                                        })
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            })
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                })
                                                                                                                            }
                                                                                                                        }
                                                                                                                    })
                                                                                                                }
                                                                                                            }
                                                                                                        })
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
                                                                    return res.status(400).json({"Message": "Unit is not under department"});
                                                                }
                                                            }
                                                        })
                        
                                                    } else {
                                                        return res.status(404).json({"Message": "Unit does not exist"});
                                                    }
                                                }
                                            })
                                        } else {
                                            return res.status(404).json({"Message": "Department does not exist"});
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else {
                    return res.status(404).json({"Message": "Employee does not exist"});
                }
            }
        })
    }
}

module.exports = {
    getAllDepartments,
    getSingledepartmentUnit,
    getSingledepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    transfer
}