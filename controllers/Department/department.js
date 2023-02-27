const Department = require("../../models/Department/department");
const Unit = require("../../models/Department/unit");
const Hod = require("../../models/Department/hod");
const Enrollment = require("../../models/Enrollment/enrollment");

const getAllDepartments = async (req, res, next) => {
    try {
        Department.find({}, (error, rs) => {
            if(error) throw error;
            else {
                if(rs.length > 0) {
                    res.status(200).json(rs);
                } else {
                    res.status(404).json({"Message": "There are no departments in the system"});
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
    const newDepartment = new Department(req.body);
    try {
        Department.findOne({dept_name: req.body.dept_name}, (error, department) => {
            if(error) throw error;
            else {
                if(department){
                    res.status(200).json(department);
                } else {
                    Unit.findOne({unit_name: req.body.dept_name}, async (error, unit) => {
                        if(error) throw error;
                        else {
                            if(unit) {
                                res.status(200).json(unit);
                            } else {
                                const DepartmentSaved = await newDepartment.save();
                                res.status(200).json(DepartmentSaved);
                            }
                        }
                    })
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const updateDepartment = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, (err, rs) => {
            if(err) throw err;
            else {
                if(rs.length > 0) {
                    const Employee_ids = rs[0].employee_ids;
                    const Department_Name = rs[0].dept_name;
                    Enrollment.updateMany({department: Department_Name},
                        {
                            department: req.body.dept_name

                        }, (error, rs) => {
                        if(error) throw error;
                        else {
                            if(rs) {
                                Department.findOne({dept_name: req.body.dept_name}, async (error, department) => {
                                    if(error) throw error;
                                    else {
                                        if(department) {
                                            res.status(200).json({"Message": "Department name already exists"});
                                        } else {
                                            Unit.findOne({unit_name: req.body.dept_name}, async (error, unit) =>{
                                                if(error) throw error;
                                                else {
                                                    if(unit) {
                                                        res.status(200).json({"Message": "Unit name already exists"});
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
                                                                                                }
                                                                                            },
                                                                                            (error, rs) => {
                                                                                                if(error) throw error;
                                                                                                else {
                                                                                                    res.status(200).json(updated_department);
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
                                res.status(404).json({"Message": "No employees are under this department"})
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
                                Enrollment.updateMany({department: Department_Name},
                                    {
                                        department: "N/A",
                                        unit: "N/A"
                                    },
                                    (error, rs) => {
                                    if(error) throw error;
                                    else {
                                        if(rs) {             
                                            Enrollment.updateMany({_id: Employee_ids},
                                                {
                                                    department: "N/A"
                                                },
                                                async (error, rs) => {
                                                    if(error) throw error
                                                    else {
                                                        const deleted_depts = await Department.findByIdAndDelete(Department_ID);
                                                        res.status(200).json(deleted_depts);
                                                    }
                                                }
                                            )
                                        }
                                        else {
                                            res.status(404).json({"Message": "No employees are under this department"})
                                        }
                                    }
                                })
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
                                return res.status(400).json({"Message" : "Cannot transfer hod"})
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
                                                                                                                                return res.status(200).json({"Message": "Successfully transfered employee"})
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