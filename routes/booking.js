const express = require('express');

const router = express.Router();

router.post('/create')
router.get('/read')
router.get('/read/:id')
router.put('/update/:id')
router.delete('/delete/:id')

module.exports = router;
