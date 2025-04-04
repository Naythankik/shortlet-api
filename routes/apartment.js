const express = require('express');
const upload = require('../src/helper/multer')
const {read, readAnApartment, deleteAnApartment, popularApartments, create} = require("../src/controllers/apartmentController");
const router = express.Router();


router.post('/create', upload.array( 'images', 10), create)
router.get('/read', read)
router.get('/popular', popularApartments)
router.get('/read/:id', readAnApartment)
router.put('/update/:id')
router.delete('/delete/:id', deleteAnApartment)

router.post('/:id/reviews')
router.get('/:id/reviews')
router.delete('/reviews/:id')

module.exports = router;
