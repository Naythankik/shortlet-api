const errorHandler = require("../../helper/error-handlers");
const User = require("../../models/user");
const Apartment = require("../../models/apartment")
const userResource = require('../../resources/userResource')
const apartmentResource = require('../../resources/apartmentResource')
const { updateRequest } = require("../../requests/userRequest");

const readProfile = async (req, res) => {
    const { id } = req.user
    try{
        const user = await User.findById(id);

        return res.status(200).json({
            profile: userResource(user)
        });
    }catch(err){
        console.error(err)
        return res.status(404).json(errorHandler(err));
    }
}

const updateProfile = async (req, res) => {
    if(!Object.keys(req.body).length){
        return res.status(422).json(errorHandler({message: 'Unprocessable entity'}))
    }

    const { error, value } = updateRequest(req.body);
    const { id } = req.user

    if(error){
        return res.status(400).json(error.map(err => errorHandler(err)));
    }

    try{
        const user = await User.findByIdAndUpdate(id, value, { new: true});

        return res.status(200).json({
            user: userResource(user)
        });
    }catch(err){
        console.error(err)
        return res.status(404).json(errorHandler(err));
    }
}

const userDashboard = async (req, res) => {
    try{
        const now = new Date();

        const [ specialOffers, popularListings, luxuryListing, rareListings ] = await Promise.all([
            // Listings with active discount
            Apartment.find({
                "discount.percentage": { $gt: 0 },
                "discount.startDate": { $lte: now },
                "discount.endDate": { $gte: now }
            }).limit(10),

            // Listings with most reviews
            Apartment.aggregate([
                {
                    $project: {
                        name: 1,
                        images: 1,
                        price: 1,
                        properties: 1,
                        address: 1,
                        reviewCount: { $size: "$reviews" }
                    }
                },
                { $sort: { reviewCount: -1 } },
                { $limit: 10 }
            ]),

            // High-end listings
            Apartment.find({
                $or: [
                    { tags: 'luxury' },
                    { price: { $gt: 50000 } } // adjust a price threshold as needed
                ]
            }).limit(10),

            // Listings with very few reviews
            Apartment.aggregate([
                {
                    $project: {
                        name: 1,
                        images: 1,
                        price: 1,
                        properties: 1,
                        address: 1,
                        reviewCount: { $size: "$reviews" }
                    }
                },
                { $match: { reviewCount: { $lt: 2 } } },
                { $limit: 10 }
            ]),
        ])

        return res.status(200).json({
            message: 'User dashboard data fetched successfully',
            data: {
                specialOffers: apartmentResource(specialOffers),
                popularListings: apartmentResource(popularListings),
                luxuryListing: apartmentResource(luxuryListing),
                rareListings: apartmentResource(rareListings),
            }
        });
    }catch (error) {
        return res.status(500).json({ message: "Failed to load dashboard", error: error.message });

    }
}

module.exports = {
    read: readProfile,
    updateProfile,
    dashboard: userDashboard
};
