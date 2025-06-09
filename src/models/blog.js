const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    name:String,
    profile:String,
    email:String,
    thumbnail:String,
    title:String,
    sub_title:String,
    content:String,
    status:{
        type:Boolean,
        default:true
    },
    created_at:{
        type:Date,
        default:null
    },
    deleted_at:Date,
    updated_at:{
        type:Date,
        default:Date.now
    }

})

blogSchema.pre('insertOne',function(){
    this.created_at = new Date();
})


blogSchema.pre('save',function(){
    this.created_at = new Date();
})

const Blog = mongoose.model('blogs',blogSchema)

module.exports = Blog