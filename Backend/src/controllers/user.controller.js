import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler ( async ( req , res ) => {
    const { fullName , userName , email , password } = req.body;

    if(fullName === "" || userName === "" || email === "" || password === ""){
        throw new ApiError(400 , "Fill all the fields...");
    }

    const existedUser = await User.findOne({email});
    if(existedUser){
        throw new ApiError(401 , "User with this Email is already exists...");
    }

    const user = await User.create({
        fullName,
        userName,
        email : email.toLowerCase(),
        password
    });

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave : false });

    const createdUser = await User.findById(user._id).select(
        " -password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(401 , "Something went wrong while creating user...")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge : 7 * 24 * 60 * 60 * 1000
    };

    return res.status(200)
        .cookies("accessToken" , accessToken , options)
        .cookies("refreshToken" , refreshToken , options)
        .json(
            new ApiResponse(200 , { user : createdUser } , "User created successfully...")
        )
})

const loginUser = asyncHandler ( async ( req , res ) => {
    const { email , password } = req.body;

    if(email === "" || password === ""){
        throw new ApiError(401 , "Fill all the fields...")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(401 , "User with this email does not found...");
    }

    const checkPassword = await user.isPasswordCorrect(password);
    if(!checkPassword){
        throw new ApiError(401 , "Password is invalid...")
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave : false });

    const loggedInUser = await User.findById(user._id).select(
        " -password -refreshToken"
    )
    if(!loggedInUser){
        throw new ApiError(401 , "Something went wrong while logging...");
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge : 7 * 24 * 60 * 60 * 1000
    };

    return res.status(200)
        .cokkies("accessToken" , accessToken , options)   
        .cokkies("refreshToken" , refreshToken , options)   
        .json(
            new ApiResponse(201 , {user : loggedInUser} , " User logged in successfully...")
        )
});

const logoutUser = asyncHandler ( async ( req , res ) => {
    const refreshToken = req.cookies?.refreshToken 
    if(!refreshToken){
        throw new ApiError(401 , "No Refresh Token Provided...")
    }

    const user = await User.findOne({refreshToken});
    if(!user){
        throw new ApiError(401 , "User not found or already logout...")
    }

    user.refreshToken = null;
    await user.save({validateBeforeSave : false})

    const options = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "none",
        path : "/",
        maxAge : 7 * 24 * 60 *60 *1000
    }

    res.clearCookie("accessToken" , accessToken)
    res.clearCookie("refreshToken" , refreshToken)
    .status(200)
    .json(new ApiResponse(201 , {} , "User Logout Successfully..."))
    
});

const refreshAccessToken = asyncHandler ( async ( req , res ) => {
    const incomingRefreshToken = req.cokkies?.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Refresh Token not found...");
    }

    const decoded =  jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET);
     
    const user = await User.findById(decoded._id);
    if(!user){
        throw new ApiError(401 , "User not found...")
    }

    if(user.refreshToken !== incomingRefreshToken){
        throw new ApiError(401 , "Invalid refreshToken...")
    }

    const accessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save({validateBeforeSave : false})

    const options = {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "none",
        path : "/",
        maxAge :  7 * 24 * 60 * 60 * 1000
    }

    return res.status(200)
        .cokkies("accessToken" , accessToken , options)
        .cokkies("refreshToken" ,newRefreshToken , options)
        .json(
            new ApiResponse(201 , {accessToken , refreshToken : newRefreshToken} , "Refresh Token Update successfully...")
        )
})





export { registerUser , loginUser , logoutUser , refreshAccessToken }