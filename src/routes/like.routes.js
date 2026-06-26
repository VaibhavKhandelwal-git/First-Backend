import { Router } from "express";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // all like routes require login

// toggle like/unlike on a video
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// toggle like/unlike on a comment
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// toggle like/unlike on a tweet
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// get all videos liked by the logged in user
router.route("/videos").get(getLikedVideos);

export default router;
