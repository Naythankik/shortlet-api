const { createRequest, updateRequest } = require("../requests/wishlistRequest");
const Wishlist = require("../models/wishlist");
const wishlistResource = require("../resources/wishlistResource")

class WishlistService {
    async createWishlist(req, res){
         try{
             const { error, value } = createRequest(req.body || {})

             if(error){
                 if(error) return res.status(400).json({ message: error.details.map(err => err.message) });
             }
             const existingWishlist = await Wishlist.findOne({
                 user: req.user.id,
                 name: value.name
             });


             if(existingWishlist) return res.status(409).json({ message: 'Wishlist with this name already exists' });

             value.user = req.user.id;

             const wishlist = await Wishlist.create({
                 name: value.name,
                 user: req.user.id,
             });
             return res.status(201).json({
                 message: "Wishlist created successfully",
                 wishlist: wishlistResource(wishlist)
             });
         }catch (e) {
             return res.status(500).json({message: e.message});
         }
     }

    async readAllWishlist(req, res){
        try{
            const wishlists = await Wishlist.find({user: req.user.id})
                .select('name apartments')
                .populate('apartments', 'name')

            return res.status(200).json({
                message: "Wishlist fetched successfully",
                wishlists: wishlistResource(wishlists)
            });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }

    async readAWishlist(req, res){
        try{
            const wishlist = await Wishlist.findOne({
                user: req.user.id,
                _id: req.params.wishlistId
            })
                .select('name apartments')
                .populate('apartments', 'name description location images');

            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found' });
            }

            return res.status(200).json({
                message: "Wishlist fetched successfully",
                wishlist: wishlistResource(wishlist)
            });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }

    async updateAWishlist(req, res){
        try{
            const { error, value } = updateRequest(req.body || {})

            if(error){
                if(error) return res.status(400).json({ message: error.details.map(err => err.message) });
            }
            // Check if no document has the name passed by the user
            const existingWishlist = await Wishlist.findOne({
                user: req.user.id,
                name: value.name,
                _id: { $ne: req.params.wishlistId }
            });

            if(existingWishlist) return res.status(409).json({ message: 'Wishlist with this name already exists' });

            const wishlist = await Wishlist.findOneAndUpdate(
                { user: req.user.id, _id: req.params.wishlistId },
                { name: value.name }
            );

            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found' });
            }

            return res.status(200).json({
                message: "Wishlist updated successfully",
                wishlist: wishlistResource(wishlist)
            });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }

    async deleteAWishlist(req, res){
        try{
            const wishlist = await Wishlist.findOneAndDelete({
                user: req.user.id,
                _id: req.params.wishlistId
            });

            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found' });
            }

            return res.status(200).json({message: "Wishlist deleted successfully"});
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }

    async deleteAnApartmentFromWishlist(req, res){
        try{
            const wishlist = await Wishlist.findOneAndUpdate(
                {
                    _id: req.params.wishlistId,
                    user: req.user.id
                },
                {
                    $pull: { apartments: req.params.apartmentId }
                }
            );


            if(!wishlist) return res.status(404).json({message: 'Wishlist not found'});

            return res.status(200).json({ message: "Apartment removed from wishlist successfully" });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }
    }

    async addAndApartmentToWishlist(req, res){
        try{
            const wishlist = await Wishlist.findOneAndUpdate(
                {
                    _id: req.params.wishlistId,
                    user: req.user.id
                },
                {
                    $addToSet: { apartments: req.params.apartmentId }
                }
            ).populate('apartments', 'name');

            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found' });
            }

            return res.status(200).json({
                message: "Apartment added to wishlist successfully",
                wishlist: wishlistResource(wishlist)
            });
        }catch (e) {
            return res.status(500).json({message: e.message});
        }

    }
}

module.exports = new WishlistService();
