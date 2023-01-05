const Unit = require("../../models/Department/unit");
const Department = require("../../models/Department/department");

const getAllUnits = async (req, res, next) =>{
    try {
        const unit = await Unit.find()
        res.status(200).json(unit);
    } catch (error) {
        next(error);
    }
}

const createUnit = async (req, res ,next) =>{
    const deptId = req.params.deptid;
    const newUnit = new Unit(req.body);
    try {
        const savedUnit = await newUnit.save();
        try {
            await Department.findByIdAndUpdate(deptId, {
                $push: {
                    unit: savedUnit._id
                }
            });
        } catch (error) {
            next(error);
        }
        res.status(200).json(savedUnit);
    } catch (error) {
        next(error); 
    }
}

const updateUnit = async (req, res , next) =>{
    try {
        const updatedUnit = await Unit.findByIdAndUpdate(
            req.params.unitid,
            {$set: req.body}, 
            {new: true}
        );
        res.status(200).json(updatedUnit);
    } catch (err) {
        next(err);
    }
}

const deleteUnit = async (req, res, next) =>{
    const deptId = req.params.deptid;
    const unitId = req.params.unitid;
    try {
        await Unit.findByIdAndDelete(unitId);
        try {
            await Department.findByIdAndUpdate(deptId, {
                $pull: {
                    unit: req.params.unitid
                }
            })
        } catch (error) {
            next(error);
        }
        res.status(200).json("Unit has been deleted");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUnits,
    createUnit,
    updateUnit,
    deleteUnit
}