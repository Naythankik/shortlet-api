const {createRequest, updateRequest} = require("../requests/bookingRequest");
const Apartment = require("../models/apartment");
const errorHandler = require("../helper/error-handlers");
const Booking = require("../models/bookings");
const bookingResource = require("../resources/bookingResource");

class BookingService {
    async createBooking  (req, res) {
        const { id } = req.user;
        const { apartmentId } = req.params;

        const { error, value } = createRequest(req.body);

        if(error) return res.status(400).json({ message: error.details.map(err => err.message) });

        try {
            const apartment = await Apartment.findById(apartmentId);
            if(!apartment){
                return res.status(404).json(errorHandler({ message: 'not found'}));
            }

            if(!apartment.isAvailable){
                return res.status(400).json(errorHandler({
                    message: `Apartment is not available now, It\'ll be available from ${apartment.availability.startDate} to ${apartment.availability.endDate}`
                }));
            }

            const checkLastBooking = await Booking.findOne({
                apartment: apartmentId,
                user: id,
            });

            // Check if the user has booked the apartment in the last 24 hours
            if (checkLastBooking && (Date.now() - Date.parse(checkLastBooking.createdAt) < 86400000)) {
                return res.status(400).json(errorHandler({
                    message: 'Apartment has already been booked by you in the last 24 hours'
                }));
            }

            const totalPrice = this.calculatePrice(apartment, value.checkInDate, value.checkOutDate);

            const payload = {
                apartment: apartmentId,
                user: id,
                totalPrice,
                ...value
            }
            const booking = await Booking.create(payload);

            return res.status(201).json({
                booking: bookingResource(booking),
                status: 201
            });
        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }

    }

    async updateBooking  (req, res) {
        const { id } = req.user;
        const { bookingId } = req.params;

        const { error, value } = updateRequest(req.body);

        if(error) return res.status(400).json({ message: error.details.map(err => err.message) });

        try {
            const booking = await Booking.findById(bookingId);

            if(!booking){
                return res.status(404).json(errorHandler({ message: 'not found'}));
            }

            if(booking.user.toString() !== id){
                return res.status(422).json({message: 'Invalid request'})
            }

            if(booking.bookingStatus !== 'booked'){
                return res.status(400).json({ message: 'Booking not available cause it has been completed or cancelled' });
            }

            const startDate = value.checkInDate ?? booking.startDate;
            const endDate = value.checkOutDate ?? booking.endDate;

            if(startDate && endDate){
                const apartment = await Apartment.findById(booking.apartment)

                if(!this.checkAvailability(apartment, startDate, endDate)){
                    return res.status(400).json({ message: 'Apartment is not available for the specified date selected' });
                }
                value.totalPrice = this.calculatePrice(apartment, startDate, endDate);
            }
            const payload = {...value}

            await booking.updateOne(payload,{ new: true});

            return res.status(201).json({
                message: "Booking updated successfully",
                booking: bookingResource(await Booking.findById(bookingId)),
            });
        }catch(err){
            console.error(err);
            res.status(500).send({message: err.message});
        }

    }

    async readABooking (req, res) {
        const { id } = req.user;
        const { bookingId } = req.params;

        try{
            const booking = await Booking.findById(bookingId)
                .populate("apartment", 'name description location images');

            if(!booking){
                return res.status(404).json(errorHandler({ message: 'not found'}));
            }

            if(booking.user.toString() !== id){
                return res.status(422).json({message: 'Invalid request'})
            }

            return res.status(200).json({
                booking: bookingResource(booking)
            })
        }catch(err){
            console.error(err);
            return res.status(500).send({message: err.message});
        }
    }

    async readAllBooking (req, res) {
        const { id } = req.user;
        const { page = 1, limit = 15, date } = req.query;
        const skip = (page - 1) * limit;
        let query= { user: id };

        if(date){
            query.createdAt = { $gte: date.replaceAll('-', '/') };
        }

        try{
            const booking = await Booking.find(query)
                .select('-user')
                .populate("apartment", 'name description location images address')
                .skip(skip)
                .limit(limit);
            const countDocument = await Booking.find(query).countDocuments();

            return res.status(200).json({
                booking: booking ? bookingResource(booking) : booking,
                meta: {
                    page,
                    limit,
                    total: countDocument
                }})
        }catch(err){
            console.error(err);
            return res.status(500).send({message: err.message});
        }
    }

    async cancelABooking (req, res) {
        const { bookingId } = req.params;

        try{
            const booking = await Booking.findOneAndUpdate({
                _id: bookingId,
                user: req.user.id
            }, {
                bookingStatus: 'cancelled'
            },{new: true})

            if(!booking){
                return res.status(404).json(errorHandler({ message: 'not found'}));
            }

            return res.status(200).json({message: 'Booking cancelled successfully'});
        }catch(err){
            console.error(err);
            return res.status(500).send({message: err.message});
        }
    }

    calculatePrice(apartment, checkInDate, checkOutDate) {
        const nights = (new Date(checkOutDate) - new Date(checkInDate)) / 86400000;
        let price = nights * apartment.price;

        if (apartment.discount) {
            const { percentage, startDate, endDate } = apartment.discount;
            const now = new Date();

            //The discount is independent of the nights, the percentage value is removed from the total amounts
            if (now >= new Date(startDate) && now <= new Date(endDate)) {
                price -= (percentage / 100) * price;
            }
        }
        return Math.round(price);
    }

    checkAvailability(apartment, checkInDate, checkOutDate) {
        const { startDate, endDate } = apartment.availability;

        return new Date(startDate) <= new Date(checkInDate) &&
            new Date(endDate) >= new Date(checkOutDate);
    }
}

module.exports = new BookingService();
