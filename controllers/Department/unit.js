const Unit = require("../../models/Department/unit");
const Department = require("../../models/Department/department");
const Enrollment = require("../../models/Enrollment/enrollment");

const getAllUnitsUnderDepartment = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, (err, dept) => {
            if(err) throw err;
            else {
                if(dept.length > 0) {
                    Unit.aggregate([
                        {
                            $match: {
                                "dept.dept_id": Department_ID
                            }
                        },
                        {
                            $project: {
                                numberOfUnits: { $cond: {if: { $isArray: "$unit"}, then: { $size: "$unit"}, else: "N/A"}}
                            }
                        }
                    ], (error, length) => {
                        if(error) throw error;
                        else {
                            if(length) {
                                Unit.aggregate([ 
                                    {
                                        $match: {
                                            "dept.dept_id": Department_ID
                                        }
                                    },
                                    {
                                        $project: {
                                            unit: {$reverseArray: "$unit"}
                                        }
                                    }],
                                    (error, unit) => {
                                        if(error) throw error;
                                        else {
                                            if(length[0].numberOfUnits > 0) {
                                                if(unit.length > 0) {
                                                    res.status(200).json(unit[0]);
                                                }
                                            } else {
                                                res.status(404).json({"Message": "There are no units under this department"});
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

const createUnit = async (req, res ,next) => {
    const emptyFields = [];
    let mapped_unit = req.body.unit.map((unit) => unit.unit_name);
    let filter = mapped_unit.filter((unit) => unit === "")
    if(filter.length > 0) {
        emptyFields.push("unit_name");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field", emptyFields})
    } else {
        const name_unit = req.body.unit.map((unit) => (unit.unit_name))

        if(name_unit.length !== new Set(name_unit).size) {
            res.status(400).json({"Message": "Unit name fields are matching"})
        } else {
            let Invalid_unit_name = /\s\s/g
            let Unit_Name = /^[a-zA-Z]+(\s+[a-zA-Z]+)*$/g
            let Invalid_unit_name_match = req.body.unit.map((unit) => unit.unit_name.match(Invalid_unit_name));
            let unit_name_match = req.body.unit.map((unit) => (unit.unit_name.match(Unit_Name)));
            if((unit_name_match.filter((unit) => unit === null)).length > 0 || (Invalid_unit_name_match.filter((unit) => unit !== null)).length > 0) {
                res.status(400).json({"Message": "Invalid spacing at unit name"})
            } else {
                if(req.body.unit.length > 0) {
                    const Department_ID = req.params.dept_id;
                    try {
                        Department.find({_id: Department_ID}, async (error, rs) => {
                            if(error) throw error;
                            else {
                                if(rs.length > 0) {
                                    let Department_Name = rs[0].dept_name;
                                    Unit.findOne({
                                        "dept.dept_id": Department_ID,
                                        "unit.unit_name": req.body.unit.map((unit) => (
                                            unit.unit_name
                                        ))
                                    }, (error, unit) => {
                                        if(error) throw error;
                                        else {
                                            if(unit){
                                                res.status(400).json({"Message": "Unit name already exists"});
                                            } else {
                                                Department.findOne({
                                                    dept_name: req.body.unit.map((unit) => (
                                                        unit.unit_name
                                                    ))
                                                }, async (error, department) => {
                                                    if(error) throw error;
                                                    else {
                                                        if(department) {
                                                            res.status(400).json({"Message": "Unit name matches an already existing department"});
                                                        } else {
                                                            Unit.findOneAndUpdate({"dept.dept_id": Department_ID}, 
                                                            {
                                                                $push: {
                                                                    unit: req.body.unit.map((unit) => (
                                                                        {
                                                                            unit_name: unit.unit_name,
                                                                            dept_name: Department_Name
                                                                        }
                                                                    ))
                                                                },
                                                                
                                                            },
                                                            {new: true},
                                                            async (error, rs) => {
                                                                if(error) throw error;
                                                                else {
                                                                    if(rs) {
                                                                        Unit.aggregate([
                                                                            {
                                                                                $match: {
                                                                                    "dept.dept_id": Department_ID
                                                                                }
                                                                            },
                                                                            {
                                                                                $project: {
                                                                                    unit: {$reverseArray: "$unit"}
                                                                                }
                                                                            }
                                                                        ], (error, rs) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                if(rs.length > 0) {
                                                                                    const savedUnit = rs[0].unit
                                                                                    Department.findByIdAndUpdate(Department_ID, {
                                                                                        $push: {
                                                                                            unit: req.body.unit.map((unit) => (
                                                                                                {
                                                                                                    unit_name:unit.unit_name
                                                                                                }
                                                                                                ))
                                                                                            }
                                                                                        }, 
                                                                                        (error, dept) => {
                                                                                            if(error) throw error;
                                                                                            else {
                                                                                                if(dept) {
                                                                                                    // console.log(allUnits[0])
                                                                                                    return res.status(200).json({"Message": "Unit(s) created successfully",savedUnit});
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }
                                                                        })
                                                                    } else {
                                                                        const newUnit = new Unit({
                                                                            unit: req.body.unit.map((unit) => (
                                                                                {
                                                                                    unit_name: unit.unit_name,
                                                                                    dept_name: Department_Name
                                                                                }
                                                                            )),
                                                                            dept: {
                                                                                dept_id: Department_ID,
                                                                                dept_name: Department_Name
                                                                            }
                                                                        });
                                                                        Department.findByIdAndUpdate(Department_ID, {
                                                                            $push: {
                                                                                unit: req.body.unit.map((unit) => (
                                                                                    {
                                                                                        unit_name: unit.unit_name
                                                                                    }
                                                                                ))
                                                                            }
                                                                        }, async (error, rs) => {
                                                                            if(error) throw error;
                                                                            else {
                                                                                if(rs) {
                                                                                    const Unit = await newUnit.save();
                                                                                    const savedUnit = Unit
                                                                                    return res.status(200).json({"Message": "Unit(s) created successfully",savedUnit});
                                                                                }
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            })
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
                    res.status(400).json({"Message": "No units added"})
                }
            }
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
                            Unit.find({"unit._id": Unit_ID}, 
                            {
                                "unit": {
                                    $elemMatch: {
                                        _id: Unit_ID
                                    }
                                }
                            },
                            (error, rs) => {
                                if(error) throw error;
                                else {
                                    if(rs.length > 0) {
                                        const Employee_ids = rs[0].unit[0].employee_ids;
                                        const Unit_Name = rs[0].unit[0].unit_name
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
                                                                Unit.find({"unit.unit_name": req.body.unit_name}, (error, rs) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(rs.length > 0) {
                                                                            res.status(400).json({"Message": "Unit name already exists"});
                                                                        } else {
                                                                            Unit.findOneAndUpdate(
                                                                                {"unit._id": Unit_ID},
                                                                                {$set: 
                                                                                    {
                                                                                        "unit.$.unit_name": req.body.unit_name
                                                                                    }
                                                                                }, 
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
                                                                                                    Department.findOneAndUpdate({"unit.unit_name": Unit_Name},
                                                                                                        {
                                                                                                            $set: {
                                                                                                                "unit.$.unit_name": req.body.unit_name
                                                                                                            }
                                                                                                        },
                                                                                                        (error, rs) => {
                                                                                                            if(error) throw error;
                                                                                                            else {
                                                                                                                if(rs) {
                                                                                                                    Unit.findOne(
                                                                                                                        {"unit._id": Unit_ID},
                                                                                                                        {
                                                                                                                            "unit": {
                                                                                                                                $elemMatch: {
                                                                                                                                    unit_name: req.body.unit_name
                                                                                                                                }
                                                                                                                            }
                                                                                                                        },
                                                                                                                        (error, rs) => {
                                                                                                                            if(error) throw error;
                                                                                                                            else {
                                                                                                                                if(rs) {
                                                                                                                                    const unitUpdated = rs.unit[0]
                                                                                                                                    res.status(200).json({"Message": "Unit name updated successfully",unitUpdated});
                                                                                                                                }
                                                                                                                            }
                                                                                                                    })
                                                                                                                }
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
                    Unit.findOne({"unit._id": Unit_ID},
                    {
                        "unit": {
                            $elemMatch: {
                                _id: Unit_ID
                            }
                        }
                    },
                    async (err, deleted_unit) => {
                        if(err) throw err;
                        else {
                            if(deleted_unit) {
                                const Employee_ids = deleted_unit.unit[0].employee_ids;
                                const Unit_Name = deleted_unit.unit[0].unit_name;
                                if(Employee_ids.length > 0) {
                                    res.status(400).json({"Message": "Transfer all employee's before deleting unit"})
                                } else {
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
                                                            "unit": {
                                                                "unit_name": Unit_Name
                                                            } 
                                                        }
                                                    }, async (error, rs) => {
                                                        if(error) throw error;
                                                        else {
                                                            Unit.findOneAndUpdate({"unit._id": Unit_ID},
                                                            {
                                                                $pull: {
                                                                    "unit": {
                                                                        "unit_name": Unit_Name
                                                                    }
                                                                }
                                                            },
                                                            (error, rs) => {
                                                                if(error) throw error;
                                                                else {
                                                                    const delete_unit = deleted_unit.unit[0]
                                                                    res.status(200).json({"Message": "Unit deleted successfully",delete_unit});
                                                                }
                                                            });
                                                        }
                                                    })
                                                } catch (error) {
                                                    next(error);
                                                }
                                            }
                                        }
                                    )
                                }
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