const express = require('express');

const router = express.Router();

router.post('/create')
router.get('/read');
router.delete('/delete/:id');

module.exports = router;
