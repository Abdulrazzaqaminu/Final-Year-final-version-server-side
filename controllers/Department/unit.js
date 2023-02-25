const Unit = require("../../models/Department/unit");
const Department = require("../../models/Department/department");
const Enrollment = require("../../models/Enrollment/enrollment");
const createError = require("../../essentials/error");

const getAllUnitsUnderDepartment = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, (err, dept) => {
            if(err) throw err;
            else {
                if(dept.length > 0) {
                    Unit.find({"dept.dept_id": Department_ID}, (error, unit) => {
                        if(error) throw error;
                        else {
                            if(unit.length > 0) {
                                res.status(200).json(unit);
                            } else if(unit.length === 0) {
                                // next(createError(404,"There are no units under this department or the department does not exist" ))
                                res.status(200).json(unit);
                            }
                        }
                    }).sort({createdAt: -1})
                } else {
                    res.status(404).json({"Message": "Department does not exist"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const createUnit = async (req, res ,next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, async (error, rs) => {
            if(error) throw error;
            else {
                if(rs.length > 0) {
                    let Department_Name = rs[0].dept_name;
                    Unit.findOne({unit_name: req.body.unit_name}, (error, unit) => {
                        if(error) throw error;
                        else {
                            if(unit){
                                res.status(200).json({"Message": "unit name already exists"});
                            } else {
                                Department.findOne({dept_name: req.body.unit_name}, async (error, department) => {
                                    if(error) throw error;
                                    else {
                                        if(department) {
                                            Department.find({}, (error, rs) => {
                                                if(error) throw error;
                                                else {
                                                    res.status(200).json({"Message": "department name already exists"});
                                                }
                                            })
                                        } else {
                                            const newUnit = new Unit({
                                                dept_id: Department_ID, unit_name: req.body.unit_name,
                                                dept: {
                                                    dept_id: Department_ID,
                                                    dept_name: Department_Name
                                                }
                                            });
                                            const savedUnit = await newUnit.save();
                                            try {
                                                await Department.findByIdAndUpdate(Department_ID, {
                                                    $push: {
                                                        unit: {
                                                            unit_id: savedUnit._id,
                                                            unit_name: req.body.unit_name
                                                        }
                                                    }
                                                });
                                            res.status(200).json(savedUnit);
                                            } catch (error) {
                                                next(error);
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    })
                    // console.log("department exists");
                } else {
                    res.status(404).json({"Message": "Department does not exist"});
                }
            }
        })
    } catch (error) {
        next(error); 
    }
}

const updateUnit = async (req, res , next) => {
    const Department_ID = req.params.dept_id;
    const Unit_ID = req.params.unit_id;
    try {
        Department.find({_id: Department_ID}, (error, rs) => {
            if(error) throw error ;
            else {
                if(rs.length > 0) {
                    Unit.find({_id: Unit_ID}, (error, rs) => {
                        if(error) throw error;
                        else {
                            if(rs.length > 0) {
                                const Employee_ids = rs[0].employee_ids;
                                Department.findOne({dept_name: req.body.unit_name}, (error, department) => {
                                    if(error) throw error;
                                    else {
                                        if(department) {
                                            res.status(200).json({"Message": "Unit name matches a departments name"});
                                        } else {
                                            Unit.findOne({"dept.dept_id": Department_ID}, (error, rs) => {
                                                if(error) throw error;
                                                else {
                                                    if(rs) {
                                                        Unit.find({unit_name: req.body.unit_name}, (error, rs) => {
                                                            if(error) throw error;
                                                            else {
                                                                if(rs.length > 0) {
                                                                    res.status(200).json({"Message": "Unit name already exists"});
                                                                } else {
                                                                    Unit.findByIdAndUpdate(
                                                                        Unit_ID,
                                                                        {$set: req.body}, 
                                                                        {new: true},
                                                                        (error, unitUpdated) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                Enrollment.updateMany({_id: Employee_ids},
                                                                                    {
                                                                                        unit: req.body.unit_name
                                                                                    },
                                                                                    (error, rs) => {
                                                                                        if(error) throw error;
                                                                                        else {
                                                                                            Department.findOneAndUpdate({"unit.unit_id": Unit_ID, "unit.unit_name": req.body.unit_name},
                                                                                                {
                                                                                                    unit: {
                                                                                                        unit_id: Unit_ID,
                                                                                                        unit_name: req.body.unit_name
                                                                                                    }
                                                                                                }, (error, rs) => {
                                                                                                    if(error) throw error;
                                                                                                    else {
                                                                                                        res.status(200).json(unitUpdated);
                                                                                                    }
                                                                                                }
                                                                                            )
                                                                                        }
                                                                                    }
                                                                                )
                                                                            }
                                                                        }
                                                                    );
                                                                    // console.log("yes")
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
                                res.status(404).json({"Message": "Unit does not exist"});
                            }
                        }
                    })
                } else {
                    res.status(404).json({"Message": "Department does not exist"});
                }
            }
        })
    } catch (err) {
        next(err);
    }
}

const deleteUnit = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    const Unit_ID = req.params.unit_id;
    try {
        Department.find({_id: Department_ID}, async (error, rs) => {
            if(error) throw error;
            else {
                if(rs.length > 0) {
                    Unit.find({_id: Unit_ID}, async (err, rs) => {
                        if(err) throw err;
                        else {
                            if(rs.length > 0) {
                                const Employee_ids = rs[0].employee_ids;
                                Enrollment.updateMany({_id: Employee_ids},
                                    {
                                        unit: "N/A"
                                    },
                                    (error, rs) => {
                                        if(error) throw error;
                                        else {
                                            try {
                                                Department.findOneAndUpdate({_id: Department_ID}, {
                                                    $pull: {
                                                        unit: {
                                                            unit_id: Unit_ID,
                                                        }
                                                    }
                                                }, async (error, rs) => {
                                                    if(error) throw error;
                                                    else {
                                                        const delete_unit = await Unit.findByIdAndDelete(Unit_ID);
                                                        res.status(200).json(delete_unit);
                                                    }
                                                })
                                            } catch (error) {
                                                next(error);
                                            }
                                        }
                                    }
                                )
                            } else {
                                res.status(404).json({"Message": "Unit does not exist"});
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

module.exports = {
    getAllUnitsUnderDepartment,
    createUnit,
    updateUnit,
    deleteUnit
}