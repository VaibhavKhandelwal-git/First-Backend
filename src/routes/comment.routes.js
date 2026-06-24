import { Router } from "express";
import { getVideoComments, addComment, updateComment, deleteComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

router.route("/:videoId").get(optJWT, getVideoComments);

// secured routes
router.route("/:videoId").post(verifyJWT, addComment);
router.route("/c/:commentId").patch(verifyJWT, updateComment).delete(verifyJWT, deleteComment);

export default router;
