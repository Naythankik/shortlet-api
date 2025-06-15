const Stripe = require("stripe");
require("dotenv").config();
const stripe = Stripe(process.env.STRIPE_KEY);

const createCheckoutSession = async (email, payload) => {
    const { amount, currency, description, method, apartment } = payload;

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
                        unit_amount: amount,
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
            metadata:{...payload},
            success_url: `${process.env.HOSTED_URL}/apartment/${apartment}?success`,
            cancel_url: `${process.env.HOSTED_URL}/apartment/${apartment}?cancel`,
        });
        return {
            status: 200,
            message: 'Payment session created successfully',
            data: {
                id: session.id,
                url: session.url
            }
        }

    } catch (error) {
        return {
            status: error.statusCode,
            message: error.message,
            data: null
        }
    }
}

module.exports = {
    createCheckoutSession
};
