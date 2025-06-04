const wishListServices = require("../services/WishlistService");

module.exports = {
    create: wishListServices.createWishlist.bind(wishListServices),
    read: wishListServices.readAllWishlist.bind(wishListServices),
    getAWishlist: wishListServices.readAWishlist.bind(wishListServices),
    updateAWishlist: wishListServices.updateAWishlist.bind(wishListServices),
    deleteAWishlist: wishListServices.deleteAWishlist.bind(wishListServices),
    deleteAnApartment: wishListServices.deleteAnApartmentFromWishlist.bind(wishListServices),
    addAnApartment: wishListServices.addAndApartmentToWishlist.bind(wishListServices)
}
