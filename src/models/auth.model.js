const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
        type: String,
        default: ""
    },
    nativeLanguage: {
        type: String,
        default: ""
    },
    learningLanguage: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    role: {                                                    // Role-based access: user, author, admin, team
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    isVerified: { type: Boolean, default: false },
    subscription: {                                            // For premium subscriptions & paid books
        type: Boolean,
        default: false
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    audioProgress: [{                                           // Track audio listen progress per episode
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        episodeId: { type: mongoose.Schema.Types.ObjectId },     // Link to audio episode ID
        progressSeconds: { type: Number, default: 0 }
    }],
    inquiries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' }],
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
    otp: String,
    otpExpires: Date,
    likedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book'
    }]

}, { timestamps: true })


const User = mongoose.model('users', userSchema)

module.exports = User