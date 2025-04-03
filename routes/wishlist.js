const express = require('express');

const router = express.Router();

router.get('/read');
router.post('/:id')
router.delete('/:id');

module.exports = router;
