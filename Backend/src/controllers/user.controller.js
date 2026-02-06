import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

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
        userName : userName.toLowerCase(),
        email : email.toLowerCase(),
        password
    })

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

    return res.status(200)
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

    return res.status(200)
            .json(
                new ApiResponse(201 , {user : loggedInUser} , " User logged in successfully...")
            )
});




export { registerUser , loginUser }