const { Schema, model, Types } = require('mongoose');

const MessageSchema = new Schema(
    {
        // Chat id between two users
        chat: {
            type: Types.ObjectId,
            ref: 'Chat',
            required: true,
            index: true,
        },
        sender: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['text', 'image', 'file', 'video'],
            default: 'text',
        },
        text: String,
        mediaUrl: String,
        mediaType: String,
        readBy: [
            {
                type: Types.ObjectId,
                ref: 'User',
            },
        ]
    },
    { timestamps: true }
);

module.exports = model('Message', MessageSchema);
