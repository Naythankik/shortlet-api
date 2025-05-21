const errorHandler = require('../helper/error-handlers');

const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

// Base authorization middleware
const authorize = async (req, res, next, requiredRole) => {
    try {
        const { role } = req.user;

        if (role !== requiredRole) {
            return res.status(500).json(errorHandler({
                message: `Access denied. You don't have the required role: ${requiredRole}`
            }));
        }

        next();
    } catch (error) {
        return res.status(500).json(errorHandler({
            message: "Internal server error during authorization",
            statusCode: 500,
            error
        }));
    }
};

// Role-specific middleware
const adminAuthorization = (req, res, next) =>
    authorize(req, res, next, ROLES.ADMIN);

const userAuthorization = (req, res, next) =>
    authorize(req, res, next, ROLES.USER);

const ownerAuthorization = async (req, res, next) => {
    const { email } = req.auth;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json(errorHandler({ message: "Invalid user" }));
    }

    if(user.role !== "admin") {
        return res.status(403).send(errorHandler({ message: "Invalid role" }));
    }
    next()
}


module.exports = {
    adminAuthorization,
    userAuthorization,
    ownerAuthorization
};
