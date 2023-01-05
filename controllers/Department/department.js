const Department = require("../../models/Department/department");

const getAllDepartments = async (req, res, next) =>{
    try {
        const departments = await Department.find()
        res.status(200).json(departments);
    } catch (error) {
        next(error);
    }
}

const createDepartment = async (req, res, next) =>{
    const newDepartment = new Department(req.body);
    try {
        const DepartmentSaved = await newDepartment.save();
        res.status(200).json(DepartmentSaved);
    } catch (error) {
        next(error);
    }
}

const updateDepartment = async (req, res, next) =>{
    try {
        const DepartmentUpdated = await Department.findByIdAndUpdate(
            req.params.deptid,
            {$set: req.body},
            {new: true}
        );
        res.status(200).json(DepartmentUpdated);
    } catch (error) {
        next(error);
    }
}

const deleteDepartment = async (req, res, next) =>{
    try {
        await Department.findByIdAndDelete(
            req.params.deptid
        )
        res.status(200).json("Department has been deleted");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
}