require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    const JWT_SECRET = process.env.JWT_SECRET;
    if(!token) {
        return res.status(401).json({"Message": "Unauthorized entry"});
    } else {
        jwt.verify(token, JWT_SECRET, (error, admin) => {
            if(error) {
                return res.status(403).json({"Message": "Invalid token"});
            } else {
                req.admin = admin; // creating a property = req.admin
                next();
            }
        })
    }
}

module.exports = verifyToken;