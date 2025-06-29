const User = require('../../models/user');
const Token = require('../../models/token');
const userResource = require('../../resources/userResource');
const { generateOTP, generateToken, createAccessToken, createRefreshToken, verifyToken} = require("../../helper/token");
const { sendMail, getMessageTemplate } = require("../../helper/mail");
const Joi = require("joi");
const { registerRequest, loginRequest } = require("../../requests/authRequest");

const register = async (req, res) => {
    const { error, value } = registerRequest(req.body);
    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    try {
        const user = await User.findOne({email: value.email})

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User(value);

        if(newUser){
            try {
                const token = await Token.create({
                    user: newUser._id,
                    type: 'verification',
                    otp: await generateOTP(),
                    token: generateToken(),
                    userAgent: req.get('User-Agent'),
                    ip: req.ip,
                    expiresIn: Date.now() + 10 * 60 * 1000 //10 mins
                });

                const subject = 'Email Verification'
                const header = 'Your One-Time Password (OTP)';
                const content = 'We received a request to verify your account with a one-time password (OTP). Please use the following code to complete your verification:';
                const warning = 'This OTP is valid for 10 minutes only.';

                await sendMail(newUser.email, subject, getMessageTemplate(
                    header,
                    content,
                    warning,
                    token.otp,
                    token.token,
                    'verify-email'
                ));
            }catch (e){
                console.error(e)
                return res.status(422).json({ message: e.message });
            }
        }

        await newUser.save();

        return res.status(200).json({
            message: "An OTP has been sent to the provided email for verification",
            admin: userResource(newUser),
        })
    } catch (err) {
        console.error(error);
        return res.status(500).json({
            message: err.message,
        });
    }
}

const login = async (req, res) => {
    const { error, value } = loginRequest(req.body);

    if (error) {
        return res.status(422).json({ success: false, message: error.details.map(err => err.message) });
    }

    try {
        const {email, password} = value;
        const user = await User.findOne({email});

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid credentials, Try again!" });
        }

        const doesPasswordMatch = await user.comparePassword(password);
        if (!doesPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials, Try again!",
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: "User account has not been verified" });
        }

        delete user.password

        const accessToken = await createAccessToken({
            user: { email: user.email, id: user._id }
        }, process.env.JWT_EXPIRES);

        const refreshToken = await createRefreshToken({
            user: { email: user.email, id: user._id }
        }, process.env.REFRESH_TOKEN_EXPIRES || '1d');

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            access_token : accessToken,
            user: userResource(user)
        });
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login',
            error: error.message
        });
    }
}

const verifyAccount = async (req, res) => {
    const { token } = req.params;

    const { error, value } = Joi.object({
        'otp': Joi.number().required(),
    }).validate(req.body, { abortEarly: false});

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    try {
        const userToken = await Token.findOne({token}).populate("user");

        if (!userToken || !userToken.isValid) {
            return res.status(498).json({ message: "Token is invalid" });
        }

        if(userToken.otp !== value.otp){
            return res.status(401).json({message: "OTP is invalid"})
        }

        if(userToken.expiresIn <= Date.now()) {
            return res.status(498).json({
                message: "Token expired"
            })
        }

        userToken.user.isVerified = true;
        userToken.isValid = false;

        await userToken.save();
        await userToken.user.save();

        return res.status(200).json({ message: "User verified successfully" });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
}

const requestVerification = async (req, res) => {
    const token = req.params.token;
    const userToken = await Token.findOne({token}).populate('user');

    if(!userToken){
        return res.status(404).json({message: "Invalid token"});
    }

    if(Date.now() < userToken.expiresIn) {
        return res.status(498).json({message: "Token has\'nt expired yet."})
    }

    try{
        const user = userToken.user;

        if(user.isVerified){
            return res.status(422).json({
                message: "User is verified already!"
            });
        }

        try {
            const token = await Token.create({
                otp: await generateOTP(),
                token: generateToken(),
                user: user._id,
                expiresIn: Date.now() + 10 * 60 * 1000,
                type: 'verification',
                userAgent: req.get('User-Agent'),
                ip: req.ip,
            });

            const subject = 'Email Re-Verification'
            const header = 'Your One-Time Password (OTP)';
            const content = 'We received a request to verify your account with a one-time password (OTP). Please use the following code to complete your verification:';
            const warning = 'This OTP is valid for 10 minutes only.';

            await sendMail(user.email, subject, getMessageTemplate(
                header,
                content,
                warning,
                token.otp,
                token.token,
                'account/verification'
            ));

            await userToken.deleteOne();
        }catch (e){
            console.error(e)
            return res.status(422).json({ message: e.message });
        }

        return res.status(200).json({message: "Re-Verification has been sent to the provided email"})
    }catch(err){
        return res.status(500).json({error: err.message})
    }
}

const refreshAccessToken = async (req, res) => {
    console.log(req.cookies, "Nathaniel")
    const refreshToken = req.cookies?.refreshToken ||
        (req.headers.cookie && req.headers.cookie.split(';')
            .find(c => c.trim().startsWith('refreshToken='))?.split('=')[1]);

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'Access Denied. No refresh token provided'
        });
    }

    try {
        const verifiedToken = await verifyToken(refreshToken);

        if (Date.now() >= verifiedToken.exp * 1000) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expired'
            });
        }

        // Create new tokens (implement rotation)
        const newAccessToken = await createAccessToken({ user: verifiedToken.user }, process.env.JWT_EXPIRES);

        const newRefreshToken = await createRefreshToken({ user: verifiedToken.user }, process.env.REFRESH_TOKEN_EXPIRES || '1d');

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            access_token: newAccessToken
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
};

const forgotPassword = async (req, res) => {
    const { error, value } = Joi.object({
        'email': Joi.string().email().required(),
    }).validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    const { email } = value;

    try{
        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).json({
                message: 'No user found!!'
            });
        }

        const checkRequest = await Token.findOne({
            user,
            type: 'password-reset',
        });

        if(checkRequest){
            if((Date.now() - checkRequest.createdAt) <= 300000) {
                return res.status(429).json({message: "Too many request.......Wait some time before making another request."})
            }

            await checkRequest.deleteOne();
        }

        try {
            const token = await Token.create({
                token: generateToken(),
                type: 'password-reset',
                userAgent: req.get('User-Agent'),
                ip: req.ip,
                user: user._id,
                expiresIn: Date.now() + 20 * 60 * 1000 // 20 mins
            });

            const subject = 'Forget Password'
            const header = subject;
            const content = 'We received a request for password reset. Please click the button below to reset your password';
            const warning = 'This link is valid for 20 minutes only.';

            await sendMail(user.email, subject, getMessageTemplate(
                header,
                content,
                warning,
                null,
                token.token,
                'reset-password',
            ));
        }catch (e){
            console.error(e)
            return res.status(422).json({ message: e.message });
        }
        return res.status(200).json({message: "A password reset link has been sent to the provided email"})
    }catch (err){
        console.error(err)
        return res.status(500).json({error: err.message})
    }
}

const resetPassword = async (req, res) => {
    const token = req.params.token;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Reset token is required"
        });
    }

    const { error, value } = Joi.object({
        'password': Joi.string().required(),
        'confirmPassword': Joi.string().valid(Joi.ref('password')).required(),
    }).validate(req.body, { abortEarly: false});

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    const password = value.password;

    try{
        const userToken = await Token.findOne({
            token,
            type: 'password-reset',
            isValid: true
        }).populate("user");

        if (!userToken) {
            return res.status(404).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }
        if (Date.now() > userToken.expiresIn) {
            return res.status(498).json({
                success: false,
                message: "Reset token has expired. Please request a new one."
            });
        }

        const isSamePassword = await userToken.user.comparePassword(value.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as old password"
            });
        }


        userToken.user.password = password;
        await userToken.user.save();

        await Token.updateMany(
            {
                user: userToken.user._id,
                type: 'password-reset'
            },
            {
                isValid: false
            }
        );

    }catch (e){
        return res.status(500).json({message: e.message});
    }

    return res.status(200).json({message: "Password has been reset successfully"})
}

module.exports = {
    register,
    login,
    verifyAccount,
    requestVerification,
    forgotPassword,
    resetPassword,
    refreshAccessToken
};
