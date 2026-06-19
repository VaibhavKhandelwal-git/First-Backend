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

    if(!isPasswordValid){
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
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
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
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200,
                {accessToken, refreshToken},
                "Access token refreshed successfully"
            )
        )
    }
    catch(err) {
        throw new apiError(401,"Invalid Refresh Token")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res) =>{

    const {oldpassword, newpassword}=req.body;
    
    if(!oldpassword || !newpassword){
        throw new apiError(400,"All fields are required")
    }

    const user = await User.findById(req.user?._id);
    
    if(!user){
        throw new apiError(404,"User not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

    if(!isPasswordCorrect){
        throw new apiError(400,"Invalid old password")
    }

    user.password = newpassword;
    
    await user.save({validateBeforeSave=false});

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "Password changed successfully")
    )

})

const getCurrentUser = asyncHandler(async(req,res)=>{

    return res
    .status(200)
    .json(
        new apiResponse(200, req.user, "Current user fetched successfully")
    )

})

const updateAccountDetails = asyncHandler(async(req,res) =>{

    const {fullName} = req.body;

    if(!fullName){
        throw new apiError(400,"Full name is required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Account details updated successfully")
    )
})

const updateAvatar = asyncHandler(async(req,res)=>{

    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar image is required")
    }
    
    const avatar = await uploadToCloudinary(avatarLocalPath)

    if (!avatar?.url){
        throw new apiError(400,"Error while uploading avatar image")
    }

    await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set:{avatar: avatar.url}
        },
        {
            new:true    
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Avatar updated successfully")
    )

})

const updateCoverImage = asyncHandler(async(req,res)=>{

    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath){
        throw new apiError(400,"Cover image is required")
    }
    
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if (!coverImage?.url){
        throw new apiError(400,"Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set:{coverImage: coverImage.url}
        },
        {
            new:true    
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, user, "Cover image updated successfully")
    )
})

// delte old imgages of cloudinary when updating avatar and cover image to avoid unnecessary storage cost


const getUserChannelProfile = asyncHandler(async(req,res) =>{
    const {username} = req.params;

    if(!username?.trim()){
        throw new apiError(400,"Username is required")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"

            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"

            }
        },
        {
            $addFields:{
                subscribersCount:{$size:"$subscribers"},
                subscribedToCount:{$size:"$subscribedTo"},
                isSubscribed: {
                    $cond:{
                        if:{
                            $in:[req.user?._id, "$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }
                }
            }
            
        },
        {
            $project:{
                username:1,
                fullName:1,
                avatar:1,
                coverImage:1,
                subscribersCount:1,
                subscribedToCount:1,
                isSubscribed:1
            }
        },
        
    ])
    if(!channel?.length){
        throw new apiError(404,"Channel not found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0], "Channel profile fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localFeild:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    project:{
                                        username:1,
                                        fullName:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $arrayElemAt:["$owner",0]
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    )
}
)




export {registerUser, loginUSer, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateCoverImage, updateAvatar, getUserChannelProfile}