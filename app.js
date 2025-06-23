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

const authentication = require('./src/middlewares/authentication')
const { userAuthorization } = require("./src/middlewares/authorization");

const app = express();
connection();


// Passing this cause the json() middleware interrupts the webhook request.
app.use('/api/v1/shortlet-api/webhook', webhookRoutes)


app.use(helmet());
app.use(cors({
    origin: process.env.HOSTED_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'authorization', 'Cookie'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/v1/shortlet-api/auth', authRoutes)
app.use('/api/v1/shortlet-api/user', authentication, userAuthorization, userRoutes)
app.use('/api/v1/shortlet-api/apartments', authentication, apartmentRoutes)
app.use('/api/v1/shortlet-api/bookings', authentication, bookingRoutes)
app.use('/api/v1/shortlet-api/payments', authentication, paymentRoutes)

// Admin side of things
app.use('/api/v1/shortlet-api/admin', adminRoutes)
app.use('/api/v1/shortlet-api/wishlists', authentication, wishlistRoutes)
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
