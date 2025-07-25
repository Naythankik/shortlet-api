const express = require('express');
const {createCheckoutSession} = require("../src/controllers/UserControllers/paymentController");

const router = express.Router();

router.post('/:bookingId/create-checkout-session', createCheckoutSession)

module.exports = router;
