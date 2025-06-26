const express = require('express');
const {read, updateProfile, dashboard} = require("../src/controllers/UserControllers/userController");

const router = express.Router();

router.route('/profile').get(read).put(updateProfile)
router.route('/dashboard').get(dashboard)

module.exports = router;
