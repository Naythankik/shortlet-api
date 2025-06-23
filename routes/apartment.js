const express = require('express');
const upload = require('../src/helper/multer')
const { read, readAnApartment, deleteAnApartment, popularApartments, create, update, addReview, getReviews, deleteReview } = require("../src/controllers/UserControllers/apartmentController");
const { userAuthorization, ownerAuthorization } = require("../src/middlewares/authorization");
const router = express.Router();


router.post('/create',ownerAuthorization, upload.array( 'images', 10), create)
router.get('/read', userAuthorization, read)
router.get('/popular', userAuthorization, popularApartments)
router.get('/read/:apartmentId', userAuthorization, readAnApartment)
router.put('/update/:id',ownerAuthorization, upload.array( 'images', 10), update)
router.delete('/delete/:id',ownerAuthorization, deleteAnApartment)

router.post('/:id/reviews', userAuthorization, addReview )
router.get('/:id/reviews',ownerAuthorization, getReviews)
router.delete('/:id/reviews/:reviewId', userAuthorization, deleteReview)

module.exports = router;
