const User = require("../models/user");
const errorHandler = require('../helper/error-handlers');

const adminAuthorization = async (req, res, next) => {
    const { email } = req.auth;
    const admin = await User.findOne({ email });
    if (!admin) {
        return res.status(401).json(errorHandler({ message: "Admin not found" }));
    }

    if(admin.role !== "admin") {
        return res.status(403).json(errorHandler({ message: "Invalid role" }));
    }
    next()
};


const userAuthorization = async (req, res, next) => {
    const { email } = req.auth;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json(errorHandler({ message: "not found" }));
    }

    if(user.role !== "user") {
        return res.status(403).send(errorHandler({ message: "Invalid role" }));
    }
    next()
}

module.exports = {
    adminAuthorization,
    userAuthorization,
};
