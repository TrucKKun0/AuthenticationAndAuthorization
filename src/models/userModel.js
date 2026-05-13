const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    passwordHash : {
        type :String,
        required : true
    },
    role : {
        type : String,
        enum :["user","admin"],
        default : "user"
    },
    isEmailVerified :{
        type : Boolean,
        default : false
    },
    name : {
        type : String
    },
    twoFactorEnabled : {
        type : Boolean,
        default : false
    },
    twoFactorSecret : {
        type : String,
        default : undefined
    },
    tokenVersion : {
        type : Number,
        default : 0
    },
    resetPasswordToken : {
        type : String,
        default : undefined
    },
    resetPasswordExpires : {
        type : Date,
        default : undefined
    }

},{timestamp : true});


module.exports = mongoose.model("User",userSchema);