const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    audioUrl: { type: String, required: true },
    duration: { type: String },
    description: { type: String },
    audioPublicId: { type: String, required: true },
    episodeNumber: { type: Number, required: true }, // sorting
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    listens: { type: Number, default: 0 },
}, { timestamps: true });

const bookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory',
        required: true
    },
    author: { type: String, required: true },
    coverImage: { type: String },
    bookPdf: { type: String },
    bookPdfPublicId: { type: String },
    episodes: [episodeSchema],
    price: { type: Number, required: true },
    mrp: { type: Number },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],


    // 🔥 Access Control
    accessType: {
        type: String,
        enum: ['free', 'premium', 'paid'],
        default: 'free'
    },
    featured: { type: Boolean, default: false },
    status: { type: Boolean, default: true }, // Active/inactive
    availableForOrder: { type: Boolean, default: true },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        role: { type: String, enum: ['admin', 'moderator'], required: true }
    },
    deleted_at: { type: Date, default: null }
}, { timestamps: true })

const Book = mongoose.model('book', bookSchema);
module.exports = Book;