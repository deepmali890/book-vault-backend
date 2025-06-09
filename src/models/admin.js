const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    logo: { type: String, required: true },
    favicon: { type: String, required: true },
    linkdin: { type: String, required: true },
    github: { type: String, required: true },
    twiter: { type: String, required: true },
    facebook: { type: String, required: true },
    instagram: { type: String, required: true },
    age: {
        type: Number,
        default: 0

    },
    gender: {
        type: String,
        default: "male"
    },
    country: {
        type: String,
    },

    created_at: {
        type: Date,
        default: null
    },
    deleted_at: Date,
    updated_at: {
        type: Date,
        default: Date.now
    }



})

adminSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Admin = mongoose.model('admins', adminSchema)

module.exports=Admin;