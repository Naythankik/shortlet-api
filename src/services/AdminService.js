const Apartment = require("../models/apartment");
const Booking = require("../models/bookings");
const User = require('../models/user');
const bookingResource = require("../resources/bookingResource");
const apartmentResource = require("../resources/apartmentResource");
const userResource = require("../resources/userResource");
const errorHandler = require('../helper/error-handlers');

class AdminService {
    async readAllUsers  (req, res) {
        const { page = 1, limit = 15 } = req.query;
        const skip = (page - 1) * limit;

        try{
            const users = await User.find({role: { $ne: 'admin' } })
                .select('-role')
                .skip(skip)
                .limit(limit);

            const totalUsers = await User.countDocuments({role: { $ne: 'admin' } })

            return res.status(200).json({
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    totalApartments: totalUsers,
                    itemsPerPage: Number(limit)
                },
                users: userResource(users)
            });
        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }
    }

    async readAllBookingsForAUser  (req, res) {
        const { id } = req.params;
        const { page = 1, limit = 15 } = req.query;
        const skip = (page - 1) * limit;

        try{
            const bookings = await Booking.find()
                .populate('apartment', 'name')
                .skip(skip)
                .limit(limit);

            const totalBookings = await Booking.countDocuments({})

            return res.status(200).json({
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalBookings / limit),
                    totalBookings: totalBookings,
                    itemsPerPage: Number(limit)
                },
                bookings: bookingResource(bookings)
            });
        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }
    }

    async readAllApartments  (req, res) {
        const { page = 1, limit = 15 } = req.query;
        const skip = (page - 1) * limit;

        try{
            const apartments = await Apartment.find({owner: { $ne: req.auth.id } })
                .select('_id name address images price')
                .skip(skip)
                .limit(limit);
            const totalApartments = await Apartment.countDocuments({owner: { $ne: req.auth.id } })

            return res.status(200).json({
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalApartments / limit),
                    totalApartments: totalApartments,
                    itemsPerPage: Number(limit)
                },
                apartments: apartmentResource(apartments),
            });
        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }
    }

    async getAUser (req, res) {
        const { id } = req.params;

        try{
            const user = await User.findById(id)
                .populate('apartment', 'name');

            if(!user){
                return res.status(400).json(errorHandler({message: 'not found'}))
            }

            return res.status(200).json({
                user: userResource(user)
            });

        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }
    }

    async getAnApartment (req, res) {
        const { id } = req.params;

        try{
            const apartment = await Apartment.findById(id)
                .populate({
                        path: 'reviews',
                        select: '-_id -updatedAt',
                        populate: {
                            path: 'user',
                            select: 'firstName lastName profilePicture'
                        }
            });

            if(!apartment){
                return res.status(400).json(errorHandler({message: 'not found'}))
            }
            return res.status(200).json({
                apartment: apartmentResource(apartment)
            });

        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }
    }

}

module.exports = new AdminService();
