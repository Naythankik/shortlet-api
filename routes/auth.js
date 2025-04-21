const express = require('express');
const { register, login, verifyAccount, requestVerification, forgotPassword, resetPassword } = require("../src/controllers/authenticationController");

const router = express.Router();

router.post('/register', register);
router.post('/login', login)
router.post('/logout')
router.post('/verify-account/:token', verifyAccount)
router.post('/request-verification/:token', requestVerification)
router.post('/forget-password', forgotPassword)
router.post('/reset-password', resetPassword)


module.exports = router;
