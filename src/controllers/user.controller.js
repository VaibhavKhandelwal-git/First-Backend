import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import User from "../models/user.model.js";
import uploadToCloudinary from "../utils/cloudinary.js";
import upload from "../middlewares/multer.middleware.js";
import apiResponse from "../utils/api.Response.js";
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

export {registerUser};