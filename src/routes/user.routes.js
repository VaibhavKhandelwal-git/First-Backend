import { Router } from "express";
import { registerUser, loginUSer, logoutUser, refreshAccessToken,
    changeCurrentPassword, getCurrentUser, updateAccountDetails,
    updateCoverImage, updateAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";

const router=Router();

// register a new user with avatar and optional cover image
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

// login user and return access + refresh tokens
router.route("/login").post(loginUSer)

// logout user and clear cookies
router.route("/logout").post(verifyJWT, logoutUser)

// issue new access token using refresh token
router.route("/refresh-token").post(refreshAccessToken)

// change logged in user's password
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

// get currently logged in user's details
router.route("/current-user").get(verifyJWT,getCurrentUser)

// get logged in user's watch history
router.route("/watch-history").get(verifyJWT,getWatchHistory)

// update logged in user's full name
router.route("/update-account").patch(verifyJWT,updateAccountDetails)

// update logged in user's cover image
router.route("/update-cover").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)

// update logged in user's avatar
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)

// get public channel profile by username
router.route("/channel/:username").get(optJWT,getUserChannelProfile)

export default router;
