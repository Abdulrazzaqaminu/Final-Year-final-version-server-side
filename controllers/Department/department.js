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
                    const Employee_ids = rs[0].employee_ids
                    Hod.findOneAndDelete({"department.dept_id": Department_ID}, async (error, hod_deleted) =>{
                        if(error) throw error;
                        else {          
                            await Unit.deleteMany({"dept.dept_id": Department_ID});
                            try {
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

module.exports = {
    getAllDepartments,
    getSingledepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
}