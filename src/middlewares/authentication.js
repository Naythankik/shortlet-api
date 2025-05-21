const { verifyToken, createAccessToken } = require("../helper/token");
const User = require("../models/user");

const authentication = async (req, res, next) => {
    try {
        const { authorization, cookie } = req.headers;

        //Check if the request header has an authorization and a cookie token
        if (!authorization || !authorization.startsWith("Bearer ") || !cookie || !cookie.includes("refreshToken")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided"
            });
        }

        const token = authorization.split(' ')[1];

        const { user: { email, id }, exp } = await verifyToken(token);

        const user = await User.findOne({
            email,
            _id: id,
            isActive: true
        }).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Access denied. User not found or inactive"
            });
        }

        const now = Date.now().valueOf() / 1000;
        const gracePeriod = 5 * 60;

        if (exp - now <= gracePeriod) {
            const newToken = await createAccessToken({ email, id }, "1h");

            res.cookie("token", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000,
                path: '/' // Adjust based on your API path
            });
        }

        req.user = {
            email,
            id,
            role: user.role
        }
        return next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access denied. Token has expired"
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Access denied. Invalid token"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error during authentication"
        });
    }
};

module.exports = authentication;
