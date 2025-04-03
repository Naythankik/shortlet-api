const express = require('express');

const router = express.Router();

router.post('/create')
router.get('/read')
router.get('/popular')
router.get('/read/:id')
router.put('/update/:id')
router.delete('/delete/:id')

router.get('/:id/availability')
router.put('/:id/availability')

router.get('/:id/pricing')
router.put('/:id/pricing')

router.post('/:id/reviews')
router.get('/:id/reviews')
router.delete('/reviews/:id')

module.exports = router;
