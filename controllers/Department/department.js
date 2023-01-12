const Department = require("../../models/Department/department");
const Unit = require("../../models/Department/unit");

const getAllDepartments = async (req, res, next) => {
    try {
        Department.find({}, (err, rs) => {
            if(err) throw err;
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
        const DepartmentSaved = await newDepartment.save();
        res.status(200).json(DepartmentSaved);
    } catch (error) {
        next(error);
    }
}

const updateDepartment = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, async (err, rs) => {
            if(err) throw err;
            else {
                if(rs.length > 0) {
                    const DepartmentUpdated = await Department.findByIdAndUpdate(
                        Department_ID,
                        {$set: req.body},
                        {new: true}
                    );
                    res.status(200).json(DepartmentUpdated);
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
                    await Unit.deleteMany({dept_id: Department_ID});
                    try {
                        await Department.findByIdAndDelete(Department_ID);
                        res.status(200).json({"Message": "Department deleted with its units"});
                    } catch(error) {
                        next(error);
                    }
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