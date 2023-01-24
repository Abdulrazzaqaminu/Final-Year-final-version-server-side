const Unit = require("../../models/Department/unit");
const Department = require("../../models/Department/department");

const getAllUnitsUnderDepartment = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, (err, rs) => {
            if(err) throw err;
            else {
                if(rs.length > 0) {
                    Unit.find({dept_id: Department_ID}, (error, rs) => {
                        if(error) throw error;
                        else {
                            if(rs.length > 0) {
                                res.status(200).json(rs);
                            } else if(rs.length === 0) {
                                res.status(404).json({"Message": "There are no units under this department or the department does not exist"});
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
    const Department_ID = req.params.dept_id;
    const newUnit = new Unit({dept_id: Department_ID, unit_name: req.body.unit_name});
    try {
        Department.find({_id: Department_ID}, async (error, rs) => {
            if(error) throw error;
            else {
                if(rs.length > 0) {
                    Unit.findOne({unit_name: req.body.unit_name}, (error, unit) => {
                        if(error) throw error;
                        else {
                            if(unit){
                                res.status(200).json({"Message": "Unit already exists"});
                            } else {
                                Department.findOne({dept_name: req.body.unit_name}, async (error, department) => {
                                    if(error) throw error;
                                    else {
                                        if(department) {
                                            res.status(200).json({"Message": "Unit name matches a departments name"});
                                        } else {
                                            const savedUnit = await newUnit.save();
                                            try {
                                                await Department.findByIdAndUpdate(Department_ID, {
                                                    $push: {
                                                        unit: savedUnit._id
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
                                Department.findOne({dept_name: req.body.unit_name}, (error, department) => {
                                    if(error) throw error;
                                    else {
                                        if(department) {
                                            res.status(200).json({"Message": "Unit name matches a departments name"});
                                        } else {
                                            Unit.findOne({dept_id: Department_ID}, (error, rs) => {
                                                if(error) throw error;
                                                else {
                                                    if(rs) {
                                                        Unit.find({unit_name: req.body.unit_name}, async (error, rs) => {
                                                            if(error) throw error;
                                                            else {
                                                                if(rs.length > 0) {
                                                                    res.status(200).json({"Message": "Unit name already exists"});
                                                                } else {
                                                                    const updatedUnit = await Unit.findByIdAndUpdate(
                                                                        Unit_ID,
                                                                        {$set: req.body}, 
                                                                        {new: true}
                                                                        );
                                                                    res.status(200).json(updatedUnit);
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
                                await Unit.findByIdAndDelete(Unit_ID);
                                try {
                                    await Department.findByIdAndUpdate(Department_ID, {
                                        $pull: {
                                            unit: Unit_ID
                                        }
                                    })
                                } catch (error) {
                                    next(error);
                                }
                                res.status(200).json({"Message": "Unit has been deleted"});
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