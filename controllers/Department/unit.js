const Unit = require("../../models/Department/unit");
const Department = require("../../models/Department/department");
const Enrollment = require("../../models/Enrollment/enrollment");
// const createError = require("../../essentials/error");

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
                            } else {
                                // next(createError(404,"There are no units under this department or the department does not exist" ))
                                res.status(404).json({"Message": "There are no units under this department", unit});
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
    const emptyFields = [];
    if(!req.body.unit_name) {
        emptyFields.push("unit_name");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field", emptyFields})
    } else {
        const double_space = /\s\s/
        const correct_language = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/
        if(double_space.test(req.body.unit_name)) {
            res.status(400).json({"Message": "Invalid unit name"})
        } else if(correct_language.test(req.body.unit_name)){
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
                                        res.status(400).json({"Message": "Unit name already exists"});
                                    } else {
                                        Department.findOne({dept_name: req.body.unit_name}, async (error, department) => {
                                            if(error) throw error;
                                            else {
                                                if(department) {
                                                    res.status(400).json({"Message": "Unit name matches an already existing department"});
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
                                                    res.status(200).json({"Message": "Unit created successfully",savedUnit});
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
        } else {
            res.status(400).json({"Message": "Whitespace at the begining or end not acceptable"})
        }
    }
}

const updateUnit = async (req, res , next) => {
    const emptyFields = [];
    if(!req.body.unit_name) {
        emptyFields.push("edit_unit_name");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field", emptyFields})
    } else {
        const double_space = /\s\s/
        const correct_language = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/
        if(double_space.test(req.body.unit_name)) {
            res.status(400).json({"Message": "Invalid unit name"})
        } else if(correct_language.test(req.body.unit_name)){     
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
                                        const Unit_Name = rs[0].unit_name
                                        Department.findOne({dept_name: req.body.unit_name}, (error, department) => {
                                            if(error) throw error;
                                            else {
                                                if(department) {
                                                    res.status(400).json({"Message": "Unit name matches a department name"});
                                                } else {
                                                    Unit.findOne({"dept.dept_id": Department_ID}, (error, rs) => {
                                                        if(error) throw error;
                                                        else {
                                                            if(rs) {
                                                                Unit.find({unit_name: req.body.unit_name}, (error, rs) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(rs.length > 0) {
                                                                            res.status(400).json({"Message": "Unit name already exists"});
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
                                                                                                    Department.findOneAndUpdate({"unit.unit_id": Unit_ID, "unit.unit_name": Unit_Name},
                                                                                                        {
                                                                                                            $set: {
                                                                                                                "unit.$.unit_id": Unit_ID,
                                                                                                                "unit.$.unit_name": req.body.unit_name
                                                                                                            }
                                                                                                        }, (error, rs) => {
                                                                                                            if(error) throw error;
                                                                                                            else {
                                                                                                                res.status(200).json({"Message": "Unit name updated successfully",unitUpdated});
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
        } else {
            res.status(400).json({"Message": "Whitespace at the begining or end not acceptable"})
        }
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
                                                        if(rs) {
                                                            const delete_unit = await Unit.findByIdAndDelete(Unit_ID);
                                                            res.status(200).json({"Message": "Unit deleted successfully",delete_unit});
                                                        }
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