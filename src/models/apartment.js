const {default: mongoose} = require("mongoose");

const ApartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        postcode: {
            type: String,
            required: true
        }
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
            required: true
        }
    },
    discount: {
      percentage: Number,
      startDate: Date,
      endDate: Date
    },
    images: {
        type: [String],
        required: true
    },
    properties: {
        type: [String],
        required: true
    },
    rules: {
        type: [String],
        required: true
    },
    availability: {
        startDate: Date,
        endDate: Date
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        required: false
    }],
    price: {
        type: Number,
        required: true
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
}, { timestamps: true });

ApartmentSchema.index({ "address.city": 1, price: 1 });

module.exports = mongoose.model("Apartment", ApartmentSchema);
