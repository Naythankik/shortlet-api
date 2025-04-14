const express = require('express');
const {readUsers, readApartments, readAUser, readAnApartment, readBookingsForAUser} = require("../src/controllers/adminController");

const router = express.Router();

router.get('/read/apartments', readApartments)
router.get('/read/users', readUsers)

router.get('/read/bookings/:id', readBookingsForAUser)
router.get('/read/user/:id/', readAUser);
router.get('/read/apartment/:id/', readAnApartment);
router.delete('/users/:id');

module.exports = router;
