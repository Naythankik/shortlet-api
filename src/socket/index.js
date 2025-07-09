const jwt = require('jsonwebtoken');
const User = require('../models/user');

const registerSocketHandlers = (io) => {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('No token provided'));

        try {
            const { user: { id, email } } = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findOne({ _id: id, email }).select('-password');
            if (!user) return next(new Error('User not found'));

            socket.userId = id;
            next();
        } catch (err) {
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // Join a personal room
        socket.join(socket.userId.toString());

        // Join a specific chat room
        socket.on('chat:join', ({ chatId }) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        // Send a message
        socket.on('message:send', ({ chatId, message }, ack) => {
            io.to(chatId).emit('message:new', {
                chatId,
                message,
                senderId: socket.userId
            });

            ack?.({ status: 'ok' });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};

module.exports = { registerSocketHandlers };
