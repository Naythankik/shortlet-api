const Joi = require("joi");
const Admin = require("../../models/user");
const { createAccessToken, createRefreshToken } = require("../../helper/token");
const userResource = require("../../resources/userResource");

class AdminAuthController {
    async loginAdmin (req, res) {
        const { error, value } = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        }).validate(req.body || {}, { abortEarly: false });

        if(error){
            return res.status(400).json({
                message: error.details.map(err => err.message),
                success: false
            })
        }
        try{
            // Find the admin with the value passed by the user
            const admin = await Admin.findOne({email: value.email});

            // If no admin is found, return a 404 error
            if(!admin){
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                })
            }

            // If admin is found, check the role is an admin role or send an unprocessable entity error
            if(admin.role !== 'admin'){
                return res.status(442).json({ success: false,message: 'Unauthorized user'})
            }
            // Check the password specified by the admin with the one fetched from the document
            const doesPasswordMatch = await admin.comparePassword(value.password);

            if (!doesPasswordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin password is incorrect'
                });
            }

            if (!admin.isVerified) {
                return res.status(401).json({ success: false, message: "Admin account has not been verified, meet with super admin to get account verification" });
            }

            // Delete the password key-value
            delete admin.password

            const accessToken = await createAccessToken({
                admin: { email: admin.email, id: admin._id }
            }, process.env.JWT_EXPIRES);

            const refreshToken = await createRefreshToken({
                admin: { email: admin.email, id: admin._id }
            }, process.env.REFRESH_TOKEN_EXPIRES || '1d');

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                access_token : accessToken,
                admin: userResource(admin),
                success: true
            });
        }catch (err){
            res.status(err.status || 500).json({
                error: err.message || 'Internal server error',
                success: false
            })
        }
    }
}

module.exports = new AdminAuthController();
