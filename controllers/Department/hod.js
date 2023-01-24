const Department = require("../../models/Department/department");
const Unit = require("../../models/Department/unit");
const Enrollment = require("../../models/Enrollment/enrollment");
const Hod = require("../../models/Department/hod");

const assign_hod = async (req, res, next) => {
    const Department_ID = req.params.dept_id;
    try {
        Department.find({_id: Department_ID}, (error, department) => {
            if(error) throw error;
            else {
                if(department.length > 0) {
                    let Department_Name = department[0].dept_name;
                    // console.log(Department_Name);
                    Enrollment.find({email: req.body.dept_HOD_email}, (error, employee) => {
                        if(error) throw error;
                        else {
                            if(employee.length > 0) {
                                let Employee_ID = employee[0]._id;
                                let Staff_ID = employee[0].staff_ID;
                                let First_Name = employee[0].first_name;
                                let Last_Name = employee[0].last_name;
                                let Email = employee[0].email;
                                let Employee_Department = employee[0].department;
                                let Employee_Unit = employee[0].unit;
                                // console.log(Department, Unit);
                                // checking if departemnt has already been assigned a hod
                                Hod.find({"department.dept_id": Department_ID}, (error, hod_exists) => {
                                    if(error) throw error;
                                    else {
                                        if(hod_exists.length > 0){
                                            res.status(200).json({"Message": "Department already has a HOD"});
                                        } else {
                                            Department.find({"dept_HOD.hod_email": Email, }, (error, rs) => {
                                                if(error) throw error;
                                                else {
                                                    if(rs.length > 0) {
                                                        res.status(200).json({"Message": "HOD already assigned to a department"});
                                                    } else {
                                                        Department.findOneAndUpdate(
                                                            {_id:Department_ID},
                                                            {
                                                                dept_HOD: {
                                                                    hod_id: Employee_ID,
                                                                    hod_first_name: First_Name,
                                                                    hod_last_name: Last_Name,
                                                                    hod_email: Email
                                                                }
                                                            },
                                                            {new: true},
                                                            async (error, deptUpdated) => {
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
                                                                // removing employees id(hod id) from employees_id
                                                                try {
                                                                    Hod.find({employee_id: Employee_ID, "department.dept_id": Department_ID}, (error, rs) => {
                                                                        if(error) throw error;
                                                                        else {
                                                                            if(rs.length > 0) {
                                                                                const Hod_ID = rs[0].employee_id
                                                                                Department.findOneAndUpdate(
                                                                                    {employee_ids: Employee_ID}, 
                                                                                    {
                                                                                        $pull: {
                                                                                            employee_ids: Employee_ID
                                                                                        }
                                                                                    },
                                                                                    (error, rs) => {
                                                                                        if(error) throw error;
                                                                                        else {
                                                                                            Unit.findOneAndUpdate(
                                                                                                {employee_ids: Hod_ID},
                                                                                                {
                                                                                                    $pull: {
                                                                                                        employee_ids: Hod_ID
                                                                                                    }
                                                                                                },
                                                                                                (error, rs) => {
                                                                                                    if(error) throw error;
                                                                                                    else {
                                                                                                        Enrollment.findOneAndUpdate(
                                                                                                            {_id: Employee_ID},
                                                                                                            {
                                                                                                                $unset: {
                                                                                                                    department: Employee_Department,
                                                                                                                    unit: Employee_Unit
                                                                                                                }
                                                                                                            },
                                                                                                            (error, employee) => {
                                                                                                                if(error) throw error;
                                                                                                                else {
                                                                                                                    res.status(200).json(newHod);
                                                                                                                }
                                                                                                            }
                                                                                                        )
                                                                                                    }
                                                                                                }
                                                                                            )
                                                                                        }
                                                                                    }
                                                                                )
                                                                                // console.log(Hod_ID);
                                                                            } else {
                                                                                res.status(404).json({"Message": "Hod not found"});
                                                                            }
                                                                        }
                                                                    })
                                                                } catch (error) {
                                                                    next(error);
                                                                }
                                                                // console.log(deptUpdated);
                                                            }
                                                        });
                                                    }
                                                }
                                            })  
                                        }
                                    }
                                });
                                // console.log(Employee_ID+" "+Staff_ID+" "+First_Name+" "+Last_Name+" "+Email);
                            } else {
                                res.status(404).json({"Message": "Employee not found"});
                            }
                        }
                    })
                    // console.log("yes")
                } else {
                    res.status(404).json({"Message": "Department does not exist"});
                }
            }
        })
    } catch (error) {
        next(error);
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
    const Department_ID = req.params.dept_id;
    try {
        Hod.findOneAndDelete({employee_id: HOD_ID, "department.dept_id": Department_ID}, (error, hod) => {
            if(error) throw error;
            else {
                // console.log(hod_first_name, hod_last_name, hod_email);
                if(hod) {
                    const HOD_FIRST_NAME = hod.hod_first_name;
                    const HOD_LAST_NAME = hod.hod_last_name;
                    const HOD_EMAIL = hod.hod_email;
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
                            res.status(200).json({"Message": "Hod removed successfully"});
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