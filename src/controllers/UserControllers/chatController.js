const Joi = require("joi");
const Chat = require("../../models/chat");
const Message = require("../../models/message");

const chatResource = require('../../resources/chatResource')
const messageResource = require('../../resources/messageResource')

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
                participants: [senderId, receiverId]
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

        chat.lastMessage = {
            text: message,
            at: newMessage.createdAt,
            sender: senderId,
        };
        await chat.save();
        const messages = await Message.findById(newMessage._id).populate('chat')

        return res.status(201).json({
            message: 'Message sent successfully',
            chat: chatResource(chat),
            newMessage: messageResource(messages),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: ['Server error'] });
    }
};

const readChat = async (req, res) => {
    const { id } = req.user

    try{
        const chats = await Chat.find({
            participants: { $elemMatch: { $eq : id} }
        })
            .populate('lastMessage.sender', 'profilePicture firstName lastName')
            .populate('participants', 'profilePicture firstName lastName')
            .sort('-updatedAt')

        if (!chats){
            return res.status(404).json({ message: 'No chats found' })
        }
        return res.status(200).json({
            message: "Chats fetched successfully",
            chats: chats.length ? chatResource(chats) : chats
        })

    }catch (e){
        console.log(e)
        return res.status(500).json({ error: 'Server error' });
    }
}

const readMessages = async (req, res) => {
    const { id } = req.user
    const { chatId } = req.params

    try{
        const chat = await Chat.findOne({
            _id: chatId,
            participants: { $elemMatch: { $eq : id} }
        })

        if(!chat){
            return res.status(404).json({ message: 'Chat not found' })
        }

        await Message.updateMany(
            {
                chat: chatId,
                readBy: { $ne: id }
            },
            {
                $addToSet: { readBy: id }
            }
        );

        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'profilePicture firstName lastName')
            .populate('chat')
            .sort({ createdAt: 1 });

        return res.status(200).json({
            message: 'Messages fetched successfully',
            messages: messageResource(messages),
        })
    }catch (e){
        console.log(e)
        return res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    createChat,
    readChat,
    readMessages
};
