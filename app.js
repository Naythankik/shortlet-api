require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
const connection = require('./config/database')
const { Server } = require('socket.io');
const { createServer } = require('http');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const apartmentRoutes = require('./routes/apartment');
const webhookRoutes = require('./routes/webhook');
const bookingRoutes = require('./routes/booking');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notification');
const discountRoutes = require('./routes/discount');
const messageRoutes = require('./routes/message');

const { userAuthorization } = require("./src/middlewares/authorization");
const { userAuthentication } = require("./src/middlewares/authentication");
const {registerSocketHandlers} = require("./src/socket");

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.HOSTED_URL,
        methods: ['GET', 'POST']
    }
});

connection();

// Passing this cause the json() middleware interrupts the webhook request.
app.use('/api/v1/shortlet-api/webhook', webhookRoutes)


app.use(cors({
    origin: process.env.HOSTED_URL,
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
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerSocketHandlers(io);

app.use('/api/v1/shortlet-api/auth', authRoutes)
app.use('/api/v1/shortlet-api/user', userAuthentication, userAuthorization, userRoutes)
app.use('/api/v1/shortlet-api/apartments', userAuthentication, apartmentRoutes)
app.use('/api/v1/shortlet-api/bookings', userAuthentication, bookingRoutes)
app.use('/api/v1/shortlet-api/payments', userAuthentication, paymentRoutes)
app.use('/api/v1/shortlet-api/wishlists', userAuthentication, wishlistRoutes)
app.use('/api/v1/shortlet-api/chats', userAuthentication, chatRoutes)
app.use('/api/v1/shortlet-api/notifications', userAuthentication, notificationRoutes)

// Admin side of things
app.use('/api/v1/shortlet-api/admin', adminRoutes)
app.use('/api/v1/shortlet-api/discounts', discountRoutes)
app.use('/api/v1/shortlet-api/message', messageRoutes)

app.use('/', (req, res) => {
    res.status(200).json({
        message: 'Whoops!'
    })
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
