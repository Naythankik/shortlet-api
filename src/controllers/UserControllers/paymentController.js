const Stripe = require("stripe");
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_KEY);
const Booking = require("../../models/bookings");
const {createPayment} = require("../../requests/paymentRequest");

const createCheckoutSession = async (req, res) => {
    const { bookingId } = req.params;
    const { email, id } = req.user;
    const { value, error } = createPayment(req.body || {});

    if(error) {
        return res.status(400).json({
            message: error.details.map(err => err.message)
        });
    }
    const booking = await Booking.findOne({
        _id: bookingId,
        user: id
    }).populate('apartment');

    if(!booking){
        return res.status(400).send({ message: 'Booking not found' })
    }

    if(booking.paymentStatus === 'paid'){
        return res.status(422).json({ message: 'Booking already paid' })
    }

    const { method, description, currency } = value;

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            payment_method_types: [method],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: (currency || 'usd').toLowerCase(),
                        product_data: {
                            name: `Stay @ ${booking.apartment.name}`,
                            images: [booking.apartment.images[0]],
                        },
                        unit_amount: Math.ceil(booking.totalPrice * 100),
                    },
                    quantity: 1,
                },
            ],
            invoice_creation: {
                enabled: true,
                invoice_data: {
                    description: description,
                }
            },
            metadata:{
                user: id,
                booking: bookingId,
            },
            success_url: `${process.env.HOSTED_URL}/booking/${booking.apartment._id}/payment/${booking._id}?success`,
            cancel_url: `${process.env.HOSTED_URL}/booking/${booking.apartment._id}/payment/${booking._id}?cancel`,
            payment_intent_data: {
                description: description || "Apartment booking",
            },
        });

        await booking.updateOne({paymentStatus : 'processed'});

        return res.status(201).json({
            status: 200,
            message: 'Payment session created successfully',
            data: {
                paymentId: session.id,
                url: session.url
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: error.statusCode,
            message: error.message,
        })
    }
}

module.exports = {
    createCheckoutSession
};
