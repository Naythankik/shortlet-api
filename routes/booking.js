const express = require('express');
const { update, read, create, cancel, readAll } = require("../src/controllers/UserControllers/bookingController");
const { userAuthorization } = require("../src/middlewares/authorization");

const router = express.Router();

router.post('/create/:apartmentId', userAuthorization, create)
router.get('/read', userAuthorization, readAll)
router.get('/read/:bookingId', userAuthorization, read)
router.put('/update/:bookingId', userAuthorization, update)
router.put('/cancel/:bookingId', userAuthorization, cancel)

module.exports = router;
