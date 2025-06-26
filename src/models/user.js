const {default: mongoose} = require("mongoose");
const bcrypt = require('bcryptjs');

const User = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    telephone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['admin' , 'user', 'host'],
        default: 'user'
    },
    profilePicture: {
        type: String,
        required: false,
        default: 'picture.png',
    },
}, { timestamps: true });


User.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

User.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model("User", User);
