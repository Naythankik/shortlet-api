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

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;

                await Payment.create({
                    sessionId: session.id,
                    user: session.metadata.user,
                    booking: session.metadata.booking,
                    currency: session.currency,
                    paymentStatus: session.payment_status,
                    amountTotal: session.amount_total,
                    paymentMethod: session.payment_method_types[0],
                })

                await Booking.findByIdAndUpdate(session.metadata.booking, {
                    paymentStatus: session.payment_status,
                    bookingStatus: 'confirmed'
                });
                break
            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                const bookingId = failedIntent.metadata?.booking;

                if (bookingId) {
                    await Booking.findByIdAndUpdate(bookingId, {
                        paymentStatus: 'failed',
                    });
                    console.log(`Payment failed for booking ${bookingId}`);
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }catch (error) {
            console.error('Failed to save payment:', error.message);
    }
    response.status(200).end();
})

module.exports = router;
