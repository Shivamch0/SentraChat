import mongoose from "mongoose";
import bcrypt, { compare } from "bcrypt";;
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
        Lowercase : true
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    refreshToken : {
        type : string
    }
} , {timestamps : true})


userSchema.pre("save" , async function (next) {
    if(!this.isModified(password)) return next();
    this.password = await bcrypt.hash(this.password , 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAccessToken = async function () {
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

userSchema.methods.generateRefreshToken = async function () {
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