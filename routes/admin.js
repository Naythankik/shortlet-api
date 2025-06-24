const express = require('express');
const {readUsers, readApartments, readAUser, readAnApartment, readBookingsForAUser, deleteUser, deleteApartment,
    getAnalytics
} = require("../src/controllers/AdminControllers/adminController");
const adminAuth = require('../src/controllers/AdminControllers/AdminAuthController')
const {adminAuthorization} = require("../src/middlewares/authorization");
const {adminAuthentication} = require("../src/middlewares/authentication");

const router = express.Router();

// Admin Authentication
router.post('/auth/login', adminAuth.loginAdmin.bind(adminAuth))

// Admin analytics
router.get('/dashboard/stats', adminAuthentication, adminAuthorization, getAnalytics)

// User management
router.get('/users', adminAuthentication, adminAuthorization,  readUsers)
router.get('/users/:userId', adminAuthentication, adminAuthorization, readAUser);
router.delete('/users/:userId', adminAuthentication, adminAuthorization,  deleteUser)
router.get('/bookings/:userId', adminAuthentication, adminAuthorization, readBookingsForAUser)

// Apartment Management
router.get('/apartments', adminAuthentication, adminAuthorization, readApartments)
router.get('/apartments/:apartmentId', adminAuthentication, adminAuthorization, readAnApartment);
router.delete('/apartments/:apartmentId', adminAuthentication, adminAuthorization, deleteApartment)

module.exports = router;
