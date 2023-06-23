require("dotenv").config();
const Admin = require("../../models/Admin/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
    const emptyFields = [];
    if(!req.body.email) {
        emptyFields.push("email");
    }
    if(!req.body.password) {
        emptyFields.push("password");
    }
    if(emptyFields.length > 0) {
        res.status(400).json({"Message": "Fill in the appropriate field(s)", emptyFields})
    } else {
        const correct_email = /^[a-zA-Z0-9]+(?:[_][a-zA-Z0-9]+)+@gmail\.com$/
        if(correct_email.test(req.body.email)) {
            try {
                const JWT_SECRET = process.env.JWT_SECRET;
                Admin.findOne({email: req.body.email}, async (error, admin) => {
                    if(error) throw error;
                    else {
                        if(admin) {
                            let Admin_ID = admin._id;
                            let Admin_Password = admin.password;
                            const Is_Password_Correct = await bcrypt.compare(req.body.password, Admin_Password);
                            if(Is_Password_Correct) {
                                const token = jwt.sign({id: Admin_ID}, JWT_SECRET);
                                const { isAdmin, _id, ...otherDetails } = admin._doc;
                                const today = new Date();
                                let h = today.getHours();
                                let m = today.getMinutes();
                                let s = today.getSeconds();
                                var ampm = h >= 12 ? 'PM' : 'AM';
                                h = h % 12;
                                h = h ? h : 12; // the hour '0' should be '12'
                                m = m < 10 ? '0'+m : m;
                                h = h < 10 ? '0'+h : h;
                                s = s < 10 ? '0'+s : s;
                                let to_day = new Date();
                                let options = {
                                    weekday: "long", 
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric"
                                }
                                let day = to_day.toLocaleDateString("en-us", options);
                                res.cookie("access_token", token, {
                                    httpOnly: true,
                                    sameSite: 'none', 
                                    secure: true
                                }).status(200).json({...otherDetails, "loggedIn": `${day} ${h}:${m}:${s} ${ampm}`});
                            } else {
                                res.status(401).json({"Message" : "Invalid email or password"});
                            }
                        } else {
                            res.status(401).json({"Message" : "Invalid email or password"});
                        }
                    }
                })
            } catch (error) {
                next(error);
            }
        } else {
            res.status(400).json({"Message": "Invalid email format"})
        }
    }
}

const logout = async (req, res, next) => {
    try {
        res.cookie("access_token", "", {
            httpOnly: true,
            sameSite: 'none', 
            secure: true,
            expires: new Date(0)
        }).json(false);
    } catch (error) {
        next(error)
    }
}

const loggedIn = (req, res, next) => {
    try {
        const token = req.cookies.access_token;
        const JWT_SECRET = process.env.JWT_SECRET;
        if(!token) {
            res.json(false);
        } else {
            jwt.verify(token, JWT_SECRET);
            res.json(true)
        }
    } catch (error) {
        res.json(false);
    }
}

module.exports = {
    login,
    logout,
    loggedIn
};