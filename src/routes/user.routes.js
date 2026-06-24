import { Router } from "express";
import { registerUser, loginUSer, logoutUser, refreshAccessToken,
    changeCurrentPassword, getCurrentUser, updateAccountDetails,
    updateCoverImage, updateAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";

const router=Router();

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
])
    ,registerUser)

router.route("/login").post(loginUSer)  



//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/watch-history").get(verifyJWT,getWatchHistory)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/update-cover").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)

router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)

router.route("/channel/:username").get(optJWT,getUserChannelProfile)


export default router;