const Department = require("../../models/Department/department");
const Unit = require("../../models/Department/unit");
const Hod = require("../../models/Department/hod");
const Enrollment = require("../../models/Enrollment/enrollment");

const getAllDepartments = async (req, res, next) => {
    try {
        Department.find({}, (error, dept) => {
            if(error) throw error;
            else {
                if(dept.length > 0) {
                    res.status(200).json(dept);
                } else {
                    res.status(404).json({"Message": "There are no departments in the system", dept});
                }
            }
        }).sort({createdAt: -1})
    } catch (error) {
        next(error);
    }
}

const getSingledepartment = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, (err, rs) => {
            if(err) throw err;
            else {
                if(rs.length > 0) {
                    res.status(200).json(rs);
                } else {
                    res.status(404).json({"Message": "Department does not exist"});
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
                                                                                    Unit.updateMany({"dept.dept_id": Department_ID}, 
                                                                                        {
                                                                                            dept: {
                                                                                                dept_id: Department_ID,
                                                                                                dept_name: req.body.dept_name
                                                                                            },
                                                                                            $set: {
                                                                                                "unit.dept_name": req.body.dept_name
                                                                                            }
                                                                                        },
                                                                                        (error, rs) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                res.status(200).json({"Message": "Department name updated successfully",updated_department});
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
                                            Unit.findOne({unit_name: req.body.unit_name}, (error, unit) => {
                                                if(error) throw error;
                                                else {
                                                    if(unit) {
                                                        const UNIT_NAME = unit.unit_name;
                                                        const DEPARTMENT_NAME = unit.dept.dept_name
                                                        Department.findOne({_id: Department_ID, "unit.unit_name": UNIT_NAME}, (error, dept) => {
                                                            if(error) throw error;
                                                            else {
                                                                if(dept) {
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
                                                                                                Unit.findOneAndUpdate({unit_name: UNIT_NAME}, 
                                                                                                    {
                                                                                                        $push: {
                                                                                                            employee_ids: Employee_ID
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
                                                                                                                    (error, employee) => {
                                                                                                                    if(error) throw error;
                                                                                                                    else {
                                                                                                                        if(employee) {
                                                                                                                            res.status(200).json({"Message": "Successfully transfered employee", employee})
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
                                                                                                                            Unit.findOneAndUpdate({unit_name: UNIT_NAME}, 
                                                                                                                                {
                                                                                                                                    $push: {
                                                                                                                                        employee_ids: Employee_ID
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
                                                                                                                                                (error, employee) => {
                                                                                                                                                if(error) throw error;
                                                                                                                                                else {
                                                                                                                                                    if(employee) {
                                                                                                                                                        res.status(200).json({"Message": "Successfully transfered employee", employee})
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
                                                                                                                    Unit.findOneAndUpdate({employee_ids: Employee_ID}, 
                                                                                                                        {
                                                                                                                            $pull: {
                                                                                                                                employee_ids: Employee_ID
                                                                                                                            }
                                                                                                                        },
                                                                                                                        (error, updated_unit) => {
                                                                                                                        if(error) throw error;
                                                                                                                        else {
                                                                                                                            if(updated_unit) {
                                                                                                                                Unit.findOneAndUpdate({unit_name: UNIT_NAME}, 
                                                                                                                                    {
                                                                                                                                        $push: {
                                                                                                                                            employee_ids: Employee_ID
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
                                                                                                                                                (error, employee) => {
                                                                                                                                                if(error) throw error;
                                                                                                                                                else {
                                                                                                                                                    if(employee) {
                                                                                                                                                        res.status(200).json({"Message": "Successfully transfered employee", employee})
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
    getSingledepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    transfer
}