const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    to:Number,
    number:Number,
    otp:Number,
    uid:String
})

module.exports = mongoose.model("User",userSchema)