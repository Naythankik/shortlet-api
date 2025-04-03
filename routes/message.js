const express = require('express');

const router = express.Router();

router.post('/create')
router.get('/read');
router.get('/read/:id');

module.exports = router;
