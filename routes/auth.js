const express = require('express');
const { register, login, verifyAccount, requestVerification, forgotPassword, resetPassword, refreshAccessToken } = require("../src/controllers/authenticationController");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify/:token', verifyAccount);
router.post('/verify/request/:token', requestVerification);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset', resetPassword);

router.post('/refresh-token', refreshAccessToken);

module.exports = router;
