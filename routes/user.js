const express = require('express');

const router = express.Router();

router.route('/profile').get().put()

module.exports = router;
