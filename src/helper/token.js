const crypto = require("crypto");
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET;

const Token = require('../models/token');

const generateOTP = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const checkToken = await Token.findOne({otp: otp});
    if(checkToken) {
        return generateOTP();
    }
    return otp.toString();
}

const generateToken = () => {
    return crypto.randomBytes(48).toString("hex");
}

const createAccessToken = (payload, duration) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: duration
    });
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateOTP,
    generateToken,
    createAccessToken,
    verifyAccessToken,
};
