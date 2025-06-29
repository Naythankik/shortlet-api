const Wishlist = require("../models/wishlist");
const wishlistResource = require("../resources/wishlistResource")
const Apartment = require("../models/apartment");

class WishlistService {
    async createWishlist(req, res){
        const { id: userId } = req.user;
        const { apartmentId } =req.params;

        try{
            // Check if the apartment exists
            const apartment = await Apartment.findById(apartmentId);

            if(!apartment){
                return res.status(404).json({ message: 'Apartment not found' });
            }

            const wishlist = await Wishlist.findOneAndUpdate({ user: userId}, {
                 $addToSet : {
                     apartments: apartmentId
                 }
             }, { upsert: true, new: true }).select('apartments');

             return res.status(201).json({
                 message: "Apartment was added to wishlists successfully",
                 wishlist: wishlistResource(wishlist)
             });
         }catch (e) {
             return res.status(500).json({message: e.message});
         }
     }

    async readAllWishlist(req, res){
        try{
            const wishlists = await Wishlist.find({user: req.user.id})
                .select('apartments')
                .populate('apartments', 'name imagess description location price')

            return res.status(200).json({
                message: "Wishlist fetched successfully",
                wishlists: wishlistResource(wishlists)
            });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }

    async deleteAnApartmentFromWishlist(req, res){
        const { apartmentId } = req.params;
        try{
            const apartment = await Apartment.findById(apartmentId)

            if(!apartment){
                return res.status(404).json({ message: 'Apartment not found' });
            }
            const wishlist = await Wishlist.findOneAndUpdate(
                {user: req.user.id},
                {
                    $pull: { apartments: apartmentId }
                },
                {new: true}
            );

            if(!wishlist) return res.status(404).json({message: 'Wishlist not found'});

            return res.status(200).json({ message: "Apartment removed from wishlist successfully" });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }
}

module.exports = new WishlistService();
