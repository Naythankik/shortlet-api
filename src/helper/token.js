const crypto = require("crypto");
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET;

const Token = require('../models/token');

const generateOTP = async () => {
    const otpString = Math.floor( Math.random() * 999999).toString();
    const otp = otpString.padStart(6, '0') * 1;
    const checkToken = await Token.findOne({ otp: otp });
    if(checkToken) {
        return generateOTP();
    }
    return otp;
}

const generateToken = () => {
    return crypto.randomBytes(48).toString("hex");
}

const createAccessToken = (payload, duration) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: duration
    });
}

const createRefreshToken = (payload, duration) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: duration
    });
}

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    generateOTP,
    generateToken,
    createAccessToken,
    verifyToken,
    createRefreshToken
};
