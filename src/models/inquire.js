const mongoose = require('mongoose')

const inquireSchema = mongoose.Schema({
    firstname: String,
    lastaame: String,
    email: String,
    phone: String,
    message: String,
    pdf:String,
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

inquireSchema.pre('insertOne',function(){
    this.created_at = new Date();
})


inquireSchema.pre('save',function(){
    this.created_at = new Date();
})

const Inquire = mongoose.model('inquires', inquireSchema)

module.exports = Inquire