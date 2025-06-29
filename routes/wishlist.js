const express = require('express');
const { create, read, deleteAnApartment  } = require("../src/controllers/UserControllers/wishlistController");

const router = express.Router();

router.get('/', read);                                                          // Get all wishlists for a user
router.post('/:apartmentId', create)                                            // Create a new wishlist
router.delete('/:apartmentId', deleteAnApartment);                              // Remove an apartment from a wishlist

module.exports = router;
