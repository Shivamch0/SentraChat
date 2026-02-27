import mongoose from "mongoose";
import bcrypt from "bcrypt";;
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    userName : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    refreshToken : {
        type : String
    }, 
    avatar : {
        type : String,
        default : "data:image/png;base64,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"
    },
    isOnline : {
        type : Boolean,
        default : false
    },
    lastSeen : {
        type : Date
    }
} , {timestamps : true})


userSchema.pre("save" , async function () {
        if(!this.isModified("password")) return ;
        this.password = await bcrypt.hash(this.password , 10);
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            fullName : this.fullName,
            userName : this.userName,
            email : this.email,
        },
            process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRATION
        }

    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
        _id : this._id
        },
          process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRATION
        }
    )
}



export const User = mongoose.model("User" , userSchema);