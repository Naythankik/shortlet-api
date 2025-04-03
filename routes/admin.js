const express = require('express');

const router = express.Router();

router.get('/users')
router.put('/users/:id/status');
router.delete('/users/:id');

module.exports = router;
