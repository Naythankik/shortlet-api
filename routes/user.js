const express = require('express');
const {read, updateProfile} = require("../src/controllers/UserControllers/userController");

const router = express.Router();

router.route('/profile').get(read).put(updateProfile)

module.exports = router;
