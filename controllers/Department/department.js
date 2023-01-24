const Department = require("../../models/Department/department");
const Unit = require("../../models/Department/unit");
const Hod = require("../../models/Department/hod");

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
        })
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
                    res.status(200).json({"Message": "Department already exists"});
                } else {
                    Unit.findOne({unit_name: req.body.dept_name}, async (error, unit) => {
                        if(error) throw error;
                        else {
                            if(unit) {
                                res.status(200).json({"Message": "Department matches a unit name"});
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
                                            await Department.findOneAndUpdate(
                                                {_id: Department_ID},
                                                {$set: req.body},
                                                {new: true},
                                                async (error, updated_department) => {
                                                if(error) throw error;
                                                else {
                                                    await Hod.findOneAndUpdate(
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
                                                                res.status(200).json(updated_department);
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
                    Hod.findOneAndDelete({"department.dept_id": Department_ID}, async (error, hod_deleted) =>{
                        if(error) throw error;
                        else {          
                            await Unit.deleteMany({dept_id: Department_ID});
                            try {
                                await Department.findByIdAndDelete(Department_ID);
                                res.status(200).json({"Message": "Department deleted"});
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