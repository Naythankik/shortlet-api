const apartmentResource = require('./apartmentResource')
const userResource = require('./userResource')

const wishlistResource = (wishlist) => {
    return {
        id: wishlist._id,
        name: wishlist.name,
        description: wishlist.description,
        user: userResource(wishlist.user),
        apartments: apartmentResource(wishlist.apartments),
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt
    }
}

module.exports = (wishlists) => {
    if(wishlists){
        return wishlists.length > 0
            ? wishlists.map(wishlist => wishlistResource(wishlist))
            : wishlistResource(wishlists);
    }else{
        return wishlists;
    }
};
