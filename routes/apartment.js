const express = require('express');
const upload = require('../src/helper/multer')
const {read, readAnApartment, deleteAnApartment, popularApartments, create, update, addReview, getReviews,
    deleteReview
} = require("../src/controllers/apartmentController");
const router = express.Router();


router.post('/create', upload.array( 'images', 10), create)
router.get('/read', read)
router.get('/popular', popularApartments)
router.get('/read/:apartmentId', readAnApartment)
router.put('/update/:id', upload.array( 'images', 10), update)
router.delete('/delete/:id', deleteAnApartment)

router.post('/:id/reviews', addReview )
router.get('/:id/reviews', getReviews)
router.delete('/:id/reviews/:reviewId', deleteReview)

module.exports = router;
