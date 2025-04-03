require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
const connection = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const apartmentRoutes = require('./routes/apartment');
const bookingRoutes = require('./routes/booking');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const discountRoutes = require('./routes/discount');
const messageRoutes = require('./routes/message');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connection();


app.use('/api/v1/ride-hailing/auth', authRoutes)
app.use('/api/v1/ride-hailing/user', userRoutes)
app.use('/api/v1/ride-hailing/apartments', apartmentRoutes)
app.use('/api/v1/ride-hailing/bookings', bookingRoutes)
app.use('/api/v1/ride-hailing/admins', adminRoutes)
app.use('/api/v1/ride-hailing/wishlists', wishlistRoutes)
app.use('/api/v1/ride-hailing/discounts', discountRoutes)
app.use('/api/v1/ride-hailing/message', messageRoutes)


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
