const { verifyToken, createAccessToken } = require("../helper/token");
const User = require("../models/user");

const userAuthentication = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const refreshToken = req.headers.cookie.split('=')[1];

        if (!authHeader || !authHeader.startsWith("Bearer ") || !refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided"
            });
        }

        const token = authHeader.split(' ')[1];
        const { user: { email, id }, exp } = await verifyToken(token);

        const user = await User.findOne({ _id: id, email, isActive: true }).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found or inactive"
            });
        }

        const now = Date.now() / 1000;
        if (exp && exp < now + 5 * 60) {
            const newToken = await createAccessToken({ user: { email, id } }, "1h");
            res.cookie("token", newToken, {
                httpOnly: true,
                sameSite: "Strict",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 1000
            });
        }

        req.user = { email, id, role: user.role };
        next();
    } catch (err) {
        const message = err.name === "TokenExpiredError"
            ? "Token has expired"
            : err.name === "JsonWebTokenError"
                ? "Invalid token"
                : "Internal server error during authentication";

        return res.status(401).json({ success: false, message });
    }
};

const adminAuthentication = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const refreshToken = req.headers.cookie.split('=')[1];

        if (!authHeader || !authHeader.startsWith("Bearer ") || !refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided"
            });
        }

        const token = authHeader.split(" ")[1];
        const { admin: { email, id }, exp } = await verifyToken(token);

        const admin = await User.findOne({ _id: id, email, isActive: true }).select("-password");

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden. Admin access required"
            });
        }

        const now = Date.now() / 1000;
        if (exp && exp < now + 5 * 60) {
            const newToken = await createAccessToken({ admin: { email, id } }, "1h");
            res.cookie("token", newToken, {
                httpOnly: true,
                sameSite: "Strict",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 1000
            });
        }

        req.admin = { email, id, role: admin.role };
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error during admin authentication"
        });
    }
};

module.exports = {
    userAuthentication,
    adminAuthentication
};
