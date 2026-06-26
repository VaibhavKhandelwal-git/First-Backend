import { Router } from "express";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

// get all comments for a video with pagination
router.route("/:videoId").get(optJWT, getVideoComments);

// secured routes
// add a comment to a video
router.route("/:videoId").post(verifyJWT, addComment);

// update | delete a comment by commentId
router.route("/c/:commentId").patch(verifyJWT, updateComment).delete(verifyJWT, deleteComment);

export default router;
