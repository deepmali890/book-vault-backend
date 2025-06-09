const mongoose = require('mongoose');
const slugify = require('slugify');

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    SubCategoryImage: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        unique: true
    },
    status: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    deleted_at: {
        type: Date,
        default: null
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        role: { type: String, enum: ['admin', 'moderator'], required: true }
    },
},
    {
        timestamps: true
    })

// Auto-slug generation before save
subCategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const SubCategory = mongoose.model('subCategory', subCategorySchema);

module.exports = SubCategory;
