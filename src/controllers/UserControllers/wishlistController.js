const wishListServices = require("../../services/WishlistService");

module.exports = {
    create: wishListServices.createWishlist.bind(wishListServices),
    read: wishListServices.readAllWishlist.bind(wishListServices),
    deleteAnApartment: wishListServices.deleteAnApartmentFromWishlist.bind(wishListServices),
}
