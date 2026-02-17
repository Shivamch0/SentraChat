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
        type : String
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