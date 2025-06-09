const mongoose = require('mongoose')

const bookCategoryScehma = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: Boolean,
        default: true // visible on site
    },
    featured: {
        type: Boolean,
        default: false // show on homepage
    },
    deleted_at: {
        type: Date,
        default: null
    },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        role: { type: String, enum: ['admin', 'moderator'], required: true }
      },

}, {
    timestamps: true
});


const BookCategory = mongoose.model('category', bookCategoryScehma)

module.exports = BookCategory;