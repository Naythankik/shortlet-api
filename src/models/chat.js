const { Schema, model, Types } = require('mongoose');

const ChatSchema = new Schema(
    {
        participants: [
            {
                type: Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        lastMessage: {
            text: String,
            at: Date,
            sender: { type: Types.ObjectId, ref: 'User' },
        },
    },
    { timestamps: true }
);

ChatSchema.index(
    { 'participants.0': 1, 'participants.1': 1 },
    { unique: true }
);

ChatSchema.pre('validate', function (next) {
    if (this.participants.length !== 2)
        return next(new Error('A chat must contain exactly two participants'));
    this.participants.sort();
    next();
});

module.exports = model('Chat', ChatSchema);
