const Department = require("../../models/Department/department");
const Enrollment = require("../../models/Enrollment/enrollment");
const Hod = require("../../models/Department/hod");

const assign_hod = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.dept_HOD_id) {
        emptyFields.push("hod_id");
    } 
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field", emptyFields})
    } else {
        const double_space = /\s\s/
        const correct_language = /^[0-9\b]+$/
        if(double_space.test(req.body.dept_HOD_id)) {
            res.status(400).json({"Message": "Invalid email"})
        } else if(correct_language.test(req.body.dept_HOD_id)){
            const Department_ID = req.params.dept_id;
            try {
                Enrollment.findOne({staff_ID: req.body.dept_HOD_id, status: "Active"}, (error, rs) => {
                    if(error) throw error;
                    else {
                        if(rs) {
                            let Employee_ID = rs._id;
                            let Staff_ID = rs.staff_ID;
                            let First_Name = rs.first_name;
                            let Last_Name = rs.last_name;
                            let Email = rs.email;
                            let Employee_Department = rs.department;
                            Department.findOne({_id: Department_ID}, (error, rs) => {
                                if(error) throw error;
                                else {
                                    if(rs) {
                                        Department.findOne({"dept_HOD.hod_email": Email}, (error, rs) => {
                                            if(error) throw error;
                                            else {
                                                if(rs) {
                                                    res.status(400).json({"Message": "HOD already assigned to department"});
                                                } else {
                                                    Department.findOne({_id: Department_ID, dept_name: Employee_Department}, (error, rs) => {
                                                        if(error) throw error;
                                                        else {
                                                            if(rs) {
                                                                const Department_Name = rs.dept_name;
                                                                Hod.findOne({"department.dept_id": Department_ID}, (error, hod_exists) => {
                                                                    if(error) throw error;
                                                                    else {
                                                                        if(hod_exists) {
                                                                            res.status(400).json({"Message": "Department already has a HOD"});
                                                                        } else {
                                                                            Department.findOneAndUpdate({_id: Department_ID}, 
                                                                                {
                                                                                    dept_HOD: {
                                                                                        hod_id: Employee_ID,
                                                                                        hod_first_name: First_Name,
                                                                                        hod_last_name: Last_Name,
                                                                                        hod_email: Email
                                                                                    }
                                                                                },
                                                                                {new: true},
                                                                                async (error, updated_department) => {
                                                                                    if(error) throw error;
                                                                                    else {
                                                                                        const newHod = new Hod({employee_id: Employee_ID,
                                                                                            staff_ID: Staff_ID,
                                                                                            hod_first_name: First_Name,
                                                                                            hod_last_name: Last_Name, 
                                                                                            hod_email: Email, 
                                                                                            department: {
                                                                                                dept_id: Department_ID,
                                                                                                dept_name: Department_Name 
                                                                                            } 
                                                                                        });
                                                                                        await newHod.save();
                                                                                        res.status(200).json({"Message": "HOD assigned successfully",updated_department});
                                                                                    }
                                                                                }
                                                                            )
                                                                        }
                                                                    }
                                                                })
                                                            } else {
                                                                res.status(400).json({"Message": "Employee cannot head another department"});
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                        // 
                                    } else {
                                        res.status(404).json({"Message": "Department not found"});
                                    }
                                }
                            })
                        } else {
                            res.status(404).json({"Message": "Employee not found"});
                        }
                    }
                }); // first employee model
            } catch (error) {
                next(error);
            }
        } else {
            res.status(400).json({"Message": "Email should end with @gmail.com"})
        }
    }
}

const getAllHods = async (req, res, next) => {
    try {
        Hod.find({}, (error, rs) => {
            if(error) throw error;
            else {
                if(rs.length > 0) {
                    res.status(200).json(rs);
                } else {
                    res.status(404).json({"Message": "There are no hods"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const getSingleHod = async (req, res, next) => {
    const HOD_ID = req.params.hod_id;
    try {
        Hod.find({employee_id: HOD_ID}, (error, hod) => {
            if(error) throw error;
            else {
                if(hod.length > 0) {
                    res.status(200).json(hod);
                } else {
                    res.status(404).json({"Message": "Hod not found"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

const removeHod = async (req, res, next) => {
    const HOD_ID = req.params.hod_id;
    try {
        Hod.findOneAndDelete({employee_id: HOD_ID}, (error, hod) => {
            if(error) throw error;
            else {
                // console.log(hod_first_name, hod_last_name, hod_email);
                if(hod) {
                    const HOD_FIRST_NAME = hod.hod_first_name;
                    const HOD_LAST_NAME = hod.hod_last_name;
                    const HOD_EMAIL = hod.hod_email;
                    const Department_ID = hod.department.dept_id
                    Department.findByIdAndUpdate(Department_ID, {
                        // could not use $pull because dept_HOD was not an array so $unset was used
                        $unset: {
                            dept_HOD: {
                                hod_id: HOD_ID,
                                hod_first_name: HOD_FIRST_NAME,
                                hod_last_name: HOD_LAST_NAME,
                                hod_email: HOD_EMAIL
                            }
                        }
                    }, (error, department) => {
                        if(error) throw error;
                        else {
                            if(department) {
                                res.status(200).json({"Message": "Hod removed successfully"});
                            }
                        }
                    })
                } else {
                    res.status(404).json({"Message": "Hod not found"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    assign_hod,
    getAllHods,
    getSingleHod,
    removeHod
}