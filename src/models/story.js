const mongoose = require('mongoose')

const storySchema = mongoose.Schema({
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    banner: { type: String, required: true },
    video: { type: String, required: true },
    description: { type: String, required: true },
    status: {type: Boolean,default: true },
    created_at: {type: Date,default: null },
    deleted_at: Date,
    updated_at: {type: Date,default: Date.now}
})

storySchema.pre('insertOne', function () {
    this.created_at = new Date();
})


storySchema.pre('save', function () {
    this.created_at = new Date();
})

const Story = mongoose.model('stories',storySchema)

module.exports = Story;