const Admin = require("../../models/Admin/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
    try {
        Admin.findOne({email: req.body.email}, async (error, admin) => {
            if(error) throw error;
            else {
                if(admin) {
                    let Admin_ID = admin._id;
                    let Admin_Status = admin.isAdmin;
                    let Admin_Password = admin.password;
                    const Is_Password_Correct = await bcrypt.compare(req.body.password, Admin_Password);
                    if(Is_Password_Correct) {
                        const token = jwt.sign({id: Admin_ID, isAdmin: Admin_Status}, "secretekey");
                        const {password, isAdmin, ...otherDetails} = admin._doc;
                        res.cookie("access_token", token, {
                            httpOnly: true
                        }).status(200).json({...otherDetails});
                    } else {
                        res.status(404).json({"Message" : "Invalid Password"});
                    }
                } else {
                    res.status(404).json({"Message" : "Invalid email"});
                }
            }
        })
    } catch (error) {
        next(error);
    }
}

module.exports = login;