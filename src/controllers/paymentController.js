const Stripe = require("stripe");
const {createPayment} = require("../requests/paymentRequest");
const {generateToken} = require("../helper/token");
const Booking = require("../models/bookings");
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_KEY);

const createCheckoutSession = async (req, res) => {
    const { bookingId } = req.params;
    const { email, id } = req.user;
    const verifyBooking = await Booking.findOne({
        _id: bookingId,
        user: id
    });

    if(!verifyBooking) {
        return res.status(400).json({message: "Booking not found"});
    }

    const { error, value } = createPayment(req.body ?? {});

    if (error) return res.status(400).json({message: error.details.map(err => err.message)});
    const { amount, currency, description, method } = value;

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            payment_method_types: [method],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: currency.toLowerCase() || 'usd',
                        product_data: {
                            name: description || 'Shortlet Booking',
                        },
                        unit_amount: amount * 100, // Stripe expects amount in cents
                    },
                    quantity: 1,
                },
            ],
            invoice_creation: {
                enabled: true,
                invoice_data: {
                    description: 'This invoice is for the rental of an apartment',
                }
            },
            metadata:{
                user: id,
                booking: bookingId,
            },
            success_url: `${process.env.HOSTED_URL}/payment/${generateToken()}/success`,
            cancel_url: `${process.env.HOSTED_URL}/payment/${generateToken()}/cancel`,
        });

        res.status(200).json({
            message: 'Payment has been processed successfully',
            url: session.url
        });
    } catch (error) {
        if(error.statusCode === 400){
            return res.status(400).json({message: error.message});
        }
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createCheckoutSession
};
