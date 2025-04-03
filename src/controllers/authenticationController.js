const User = require('../models/user');
const Token = require('../models/token');
const userResource = require('../resources/userResource');
const { generateOTP, generateToken, createAccessToken} = require("../helper/token");
const { sendMail, getMessageTemplate } = require("../helper/mail");
const Joi = require("joi");
const e = require("express");
const { registerRequest, loginRequest} = require("../requests/authRequest");

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
                    otp: await generateOTP(),
                    token: generateToken(),
                    user: newUser._id,
                    expiresIn: Date.now() + 10 * 60 * 1000
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
                    'account-verification'
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
        return res.status(500).send({
            message: err.message,
        });
    }
}

const login = async (req, res) => {
    const { error, value } = loginRequest(req.body);

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    try {
        const {email, password} = value;
        const user = await User.findOne({email});

        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid credentials, Try again!" });
        }

        const doesPasswordMatch = await user.comparePassword(password);
        if (!doesPasswordMatch) {
            return res.status(401).send({
                success: false,
                message: "Invalid credentials, Try again!",
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: "User account has not been verified" });
        }

        user.password = undefined;

        const token = await createAccessToken({ email: user.email, id: user._id }, "3h");

        return res.status(200).send({
            access_token : token,
            admin: userResource(user)
        });
    }catch (error) {
        console.error(error);
        return res.status(400).send(error.message);
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

        if (!userToken) {
            return res.status(400).json({ message: "Token is invalid" });
        }

        if(userToken.otp !== value.otp){
            return res.status(401).send({message: "OTP is invalid"})
        }

        if(userToken.expiresIn <= Date.now()) {
            return res.status(401).send({
                message: "Token expired"
            })
        }

        userToken.user.isVerified = true;
        await userToken.user.save();

        await Token.findByIdAndDelete(userToken._id)

        return res.status(200).send({ message: "User verified successfully" });
    } catch (err) {
        return res.status(500).send({
            message: err.message,
        });
    }
}

const requestVerification = async (req, res) => {
    const { error, value } = Joi.object({
        'email': Joi.string().email().required(),
    }).validate(req.body, { abortEarly: false});

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    const { email } = value;

    try{
        const user = await User.findOne({email});

        if (!user) {
            return res.status(401).send({message: "Invalid credentials, Try again!"});
        }

        if(user.isVerified){
            return res.status(422).json({message: "User is verified already!"})
        }

        try {
            const token = await Token.create({
                otp: await generateOTP(),
                token: generateToken(),
                user: user._id,
                expiresIn: Date.now() + 10 * 60 * 1000
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
                'account-verification'
            ));
        }catch (e){
            console.error(e)
            return res.status(422).json({ message: e.message });
        }

        return res.status(200).send({message: "Re-Verification has been sent to the provided email"})
    }catch(err){
        return res.status(500).send({error: err.message})
    }
}

const forgotPassword = async (req, res) => {
    const { error, value } = Joi.object({
        'email': Joi.string().email().required(),
    }).validate(req.body, { abortEarly: false});

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    const { email } = value;

    try{
        const user = await User.findOne({email});

        if(!user) {
            return res.status(404).send({message: "No user found!!"})
        }

        const checkRequest = await Token.findOne({user});
        if(checkRequest){
            if((Date.now() - checkRequest.createdAt) <= 300000) {
                return res.status(429).send({message: "Too many request.......Wait some time before making another request."})
            }

            await checkRequest.deleteOne();
        }

        try {
            const token = await Token.create({
                token: generateToken(),
                user: user._id,
                expiresIn: Date.now() + 20 * 60 * 1000
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
                'forget-password',
            ));
        }catch (e){
            console.error(e)
            return res.status(422).json({ message: e.message });
        }
        return res.status(200).send({message: "A password reset link has been sent to the provided email"})
    }catch (err){
        console.error(e)
        return res.status(500).send({error: err.message})
    }
}

const resetPassword = async (req, res) => {
    const { error, value } = Joi.object({
        'token': Joi.string().required(),
        'password': Joi.string().required(),
        'confirmPassword': Joi.string().valid(Joi.ref('password')).required(),
    }).validate(req.body, { abortEarly: false});

    if (error) {
        return res.status(422).json({ message: error.details.map(err => err.message) });
    }

    const { token, password } = value;

    try{
        const userToken = await Token.findOne({token}).populate("user");

        if(!userToken) {
            return res.status(404).json({message: "Invalid token"});
        }

        if(Date.now() > userToken.expiresIn) {
            return res.status(498).send({message: "Token has expired.......Request for new token"})
        }

        userToken.user.password = password;
        await userToken.user.save();

        await userToken.deleteOne();
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
};
