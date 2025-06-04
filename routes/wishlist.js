const express = require('express');
const { create, read, getAWishlist, updateAWishlist, deleteAWishlist, deleteAnApartment, addAnApartment,  } = require("../src/controllers/wishlistController");

const router = express.Router();

router.get('/', read);                                                          // Get all wishlists for a user
router.get('/:wishlistId', getAWishlist);                                       // Get a specific wishlist
router.post('/', create)                                                        // Create a new wishlist
router.put('/:wishlistId', updateAWishlist)                                     // Update an existing wishlist
router.delete('/:wishlistId', deleteAWishlist);                                 // Delete a wishlist

// Apartment management in wishlists
router.post('/:wishlistId/apartments/:apartmentId', addAnApartment);            // Add an apartment to a wishlist
router.delete('/:wishlistId/apartments/:apartmentId', deleteAnApartment);       // Remove an apartment from a wishlist

module.exports = router;
