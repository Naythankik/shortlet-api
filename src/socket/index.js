const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Message = require("../models/message");
const Chat = require("../models/chat");
const messageResource = require('../resources/messageResource');

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
        socket.on('message:send', async ({ chatId, message }, ack) => {
            try {
                console.log(chatId, message)
                const newMessage = await Message.create({
                    chat: chatId,
                    sender: socket.userId,
                    type: 'text',
                    text: message,
                    readBy: [socket.userId],
                });

                await Chat.findOneAndUpdate({_id: chatId}, {
                    lastMessage: {
                        text: message,
                        at: new Date(),
                        sender: socket.userId,
                    }
                })

                const fullMessage = await Message.findById(newMessage._id)
                    .populate('chat').populate('sender', 'firstName lastName profilePicture')
                io.to(chatId).emit('message:new', messageResource(fullMessage));

                ack?.({status: 'ok', msgId: fullMessage._id});
            } catch (e) {
                console.error('Error sending message:', e);
                ack?.({status: 'error', msg: 'Failed to send message'});
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
        });
    });
};

module.exports = { registerSocketHandlers };
