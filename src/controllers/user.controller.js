import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import upload from "../middlewares/multer.middleware.js";
import apiResponse from "../utils/api.Response.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) =>
{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        
        return {accessToken, refreshToken};
    }
    catch(error){
        throw new apiError(500,"Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req,res,next) => {
    // get user details from front end
    // validation of user details
    // check if user already exists:username and email
    // check for images,avatar
    // upload to cloudinary,avatar
    // create user object-create entry in db
    // remove passwrod and refresh token field from respone
    // check for user creation
    // return response to frontend
    const {fullName, email, username, password} = req.body;
    console.log("email",email);

    if(!fullName?.trim() || !email?.trim() || !username?.trim() || !password?.trim()){
        throw new apiError(400, "All fields are required");
    }

    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (userExists) {
        throw new apiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar image is required");
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverLocalPath);

    if(!avatar){
        throw new apiError(500, "Failed to upload avatar image");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new apiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new apiResponse(201, createdUser, "User registered successfully")
    );
})

const loginUSer = asyncHandler(async (req,res,next) => {
    //req body->data
    // username or email
    // find the user
    // check password
    // access and refresh token
    // send cookies


    const {email, username, password}= req.body

    if(!(username?.trim() || email?.trim())){
        throw new apiError(400,"Username or Email is required")

    }
    
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if(!user){
        throw new apiError(404,"User Not Found")
    }

    const isPasswordValid= await user.isPasswordCorrect(password);

    if(!isPasswordalid){
        throw new apiError(401,"Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(200,
            {
                // sending in json for mobile apps
                user:loggedInUser, accessToken,
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) =>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{refreshToken: null}
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
    new apiResponse(200, {}, "User logged out successfully"))

})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized request")
    }
    
    try{
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)
        
        const user= await User.findById(decodedToken._id)

        if(!user){
            throw new apiError(401,"Invalid Refresh Token")
        }

        if(user.refreshToken !== incomingRefreshToken){
            throw new apiError(401,"Refresh Token is Expired or Used")
        }

        const options ={
            httpOnly:true,
            secure:true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(200,
                {accessToken, newRefreshToken},
                "Access token refreshed successfully"
            )
        )
    }
    catch(err) {
        throw new apiError(401,"Invalid Refresh Token")
    }

})

export {registerUser, loginUSer, logoutUser, refreshAccessToken}