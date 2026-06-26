import { Router } from "express";
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// get all videos of a user by userId from query
router.route("/").get(optJWT, getAllVideos);

// upload a new video with thumbnail
router.route("/").post(verifyJWT, upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), publishAVideo);

// get a single video by id with likes and subscriber info
router.route("/:videoId").get(optJWT, getVideoById);

// update video title, description or thumbnail | delete a video
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo).delete(verifyJWT, deleteVideo);

// toggle published/unpublished status of a video
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
