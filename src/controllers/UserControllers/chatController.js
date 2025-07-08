const Joi = require("joi");
const Chat = require("../../models/chat");
const Message = require("../../models/message");

const createChat = async (req, res) => {
    const { error, value } = Joi.object({
        receiverId: Joi.string().required().messages({
            'string.base': 'Receiver value must be a string',
            'any.required': 'Receiver is required',
        }),
        message: Joi.string().required().messages({
            'string.base': 'Message must be a string',
            'any.required': 'Message is required',
        }),
    }).validate(req.body || {}, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            error: error.details.map(err => err.message),
        });
    }

    const senderId = req.user.id;
    const { receiverId, message } = value;

    if (senderId === receiverId) {
        return res.status(400).json({ error: 'You cannot chat with yourself' });
    }

    try {
        // Check if a chat already exists between the two users
        let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        // If no chat, create one
        if (!chat) {
            chat = await Chat.create({
                participants: [senderId, receiverId],
                lastMessage: {
                    text: message,
                    at: new Date(),
                    sender: senderId,
                },
            });
        }

        // Create the first message
        const newMessage = await Message.create({
            chat: chat._id,
            sender: senderId,
            type: value.type || 'text',
            text: message,
            readBy: [senderId],
        });

        // Update last message on chat
        chat.lastMessage = {
            text: message,
            at: newMessage.createdAt,
            sender: senderId,
        };
        await chat.save();

        return res.status(201).json({
            message: 'Message sent successfully',
            chat,
            newMessage,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: ['Server error'] });
    }
};

module.exports = {
    createChat,
};
