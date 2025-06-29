require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
const connection = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const apartmentRoutes = require('./routes/apartment');
const webhookRoutes = require('./routes/webhook');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const discountRoutes = require('./routes/discount');
const messageRoutes = require('./routes/message');

const { userAuthorization } = require("./src/middlewares/authorization");
const { userAuthentication } = require("./src/middlewares/authentication");

const app = express();
connection();


// Passing this cause the json() middleware interrupts the webhook request.
app.use('/api/v1/shortlet-api/webhook', webhookRoutes)


app.use(cors({
    origin: 'https://3ird-shortlet.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Cookie'
    ],
}));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/shortlet-api/auth', authRoutes)
app.use('/api/v1/shortlet-api/user', userAuthentication, userAuthorization, userRoutes)
app.use('/api/v1/shortlet-api/apartments', userAuthentication, apartmentRoutes)
app.use('/api/v1/shortlet-api/bookings', userAuthentication, bookingRoutes)
app.use('/api/v1/shortlet-api/payments', userAuthentication, paymentRoutes)
app.use('/api/v1/shortlet-api/wishlists', userAuthentication, wishlistRoutes)

// Admin side of things
app.use('/api/v1/shortlet-api/admin', adminRoutes)
app.use('/api/v1/shortlet-api/discounts', discountRoutes)
app.use('/api/v1/shortlet-api/message', messageRoutes)

app.use('/', (req, res) => {
    res.status(200).json({
        message: 'Whoops!'
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
