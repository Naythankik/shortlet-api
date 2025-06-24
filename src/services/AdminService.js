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
                users: userResource(users),
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    totalApartments: totalUsers,
                    itemsPerPage: Number(limit)
                },
                success: true
            });
        }catch(err){
            console.error(err);
            return res.status(err.status || 500).send({
                success: false,
                message: err.message || 'Internal error'
            });
        }
    }

    async deleteAUser (req, res) {
        const { userId } = req.params;
        try{
            const user = await User.findById(userId)
            if(!user){
                return res.status(404).json({
                    success: false,
                    message: 'User with id is not found'
                })
            }

            await user.deleteOne()

            return res.status(200).json({
                success: true,
                message: 'User has been deleted successfully'
            })

        }catch (e) {
            return res.status(e.status || 500).json({
                success: false,
                message: e.message || 'Internal Server error'
            })
        }
    }

    async readAllBookingsForAUser  (req, res) {
        const { userId } = req.params;
        const { page = 1, limit = 15 } = req.query;
        const skip = (page - 1) * limit;

        try{
            const bookings = await Booking.find({user: userId})
                .populate('apartment', 'name')
                .skip(skip)
                .limit(limit);

            const totalBookings = await Booking.countDocuments({user: userId})

            return res.status(200).json({
                bookings: bookingResource(bookings),
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalBookings / limit),
                    totalBookings: totalBookings,
                    itemsPerPage: Number(limit)
                },
                success: true
            });
        }catch(err){
            return res.status(err.status || 500).json({
                message: err.message || 'Internal server error',
                success: false
            });
        }
    }

    async readAllApartments  (req, res) {
        const { page = 1, limit = 15 } = req.query;
        const skip = (page - 1) * limit;

        try{
            const apartments = await Apartment.find({ owner: { $ne: req.admin.id } })
                .select('_id name address images price')
                .skip(skip)
                .limit(limit);
            const totalApartments = await Apartment.countDocuments({owner: { $ne: req.admin.id } })

            return res.status(200).json({
                apartments: apartmentResource(apartments),
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalApartments / limit),
                    totalApartments: totalApartments,
                    itemsPerPage: Number(limit)
                },
                success: true
            });
        }catch(err){
            return res.status(err.status || 500).json({
                success: false,
                message: err.message
            });
        }
    }

    async deleteAnApartment (req, res) {
        const { apartmentId } = req.params;
        try{
            const apartment = await Apartment.findById(apartmentId)
            if(!apartment){
                return res.status(404).json({
                    success: false,
                    message: 'Apartment with id is not found'
                })
            }
            await apartment.deleteOne()

            return res.status(200).json({
                success: true,
                message: 'Apartment has been deleted successfully'
            })

        }catch (e) {
            console.log(e)
            return res.status(e.status || 500).json({
                success: false,
                message: e.message || 'Internal Server error'
            })
        }
    }

    async getAUser (req, res) {
        const { userId } = req.params;

        try{
            const user = await User.findById(userId)

            if(!user){
                return res.status(404).json(errorHandler({message: 'not found'}))
            }

            return res.status(200).json({
                user: userResource(user),
                success: true
            });

        }catch(err){
            return res.status(err.status || 500).send({
                message: err.message || 'Internal server error',
                success: false
            });
        }
    }

    async getAnApartment (req, res) {
        const { apartmentId } = req.params;

        try{
            const apartment = await Apartment.findById(apartmentId)
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
                apartment: apartmentResource(apartment),
                success: true
            });

        }catch(err){
            return res.status(err.status || 500).send({
                message: err.message,
                success: false
            });
        }
    }

    async getAnalysis(req, res) {
        try {
            const [totalUsers, totalApartments, totalBookings] = await Promise.all([
                User.countDocuments({ role: 'user' }),
                // User.countDocuments({ role: 'user', isActive: true }),
                Apartment.countDocuments(),
                Booking.countDocuments()
            ]);

            const recentBookings = await Booking.find()
                .sort({ createdAt: -1 })
                .limit(5)
                // .populate('user', 'firstName lastName')
                .populate('apartment', 'name images')

            return res.status(200).json({
                success: true,
                data: {
                    users: {
                        total: totalUsers,
                        // active: activeUsers,
                        // inactive: totalUsers - activeUsers
                    },
                    apartments: totalApartments,
                    bookings: {
                        total: totalBookings,
                        recent: bookingResource(recentBookings)
                    }
                }
            });
        } catch (error) {
            console.error("Admin Analysis Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve admin analysis"
            });
        }
    }

}

module.exports = new AdminService();
