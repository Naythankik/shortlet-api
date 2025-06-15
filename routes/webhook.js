const express = require('express');
const Stripe = require("stripe");
const Payment = require("../src/models/payment");
const Booking = require("../src/models/bookings");

const stripe = Stripe(process.env.STRIPE_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    console.log(event.type, event.data.object.id)

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        try{
            const booking = await Booking.create({
                user: session.metadata.user,
                apartment: session.metadata.apartment,
                checkInDate: session.metadata.checkInDate,
                checkOutDate: session.metadata.checkOutDate,
                guests: session.metadata.guests,
                totalPrice: session.metadata.amount,
                paymentStatus: 'paid',
                specialRequests: session.metadata.specialRequests,
            })

            await Payment.create({
                sessionId: session.id,
                user: session.metadata.user,
                booking: booking._id,
                currency: session.currency,
                paymentStatus: session.payment_status,
                amountTotal: session.amount_total,
                paymentMethod: session.payment_method_types[0],
            })

            console.log('Payment saved to DB.');
        } catch (dbErr) {
            console.error('❌ Failed to save payment:', dbErr.message);
        }
    }


    response.status(200).end();
})

module.exports = router;
