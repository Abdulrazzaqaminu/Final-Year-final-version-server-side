const jwt = require("jsonwebtoken");
const createError = require("../essentials/error");

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if(!token) {
        return next(createError(401, "You are not authenticated"));
    } else {
        jwt.verify(token, "secretekey", (error, admin) => {
            if(error) {
                return next(createError(403, "Invalid token"));
            } else {
                req.admin = admin; // creating a property = req.admin
                next();
            }
        })
    }
}
// const verifyAdmin = (req, res, next) => {
//     verifyToken(req, res, next, () => {
//         if(req.admin.isAdmin) {
//             next();
//         } else {
//             res.status(403).json({"Message": "You are not an admin"});
//         }
//     })
// }

module.exports = verifyToken;