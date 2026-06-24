import { Router } from "express";
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(optJWT, getAllVideos);

// secured routes
router.route("/").post(verifyJWT, upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), publishAVideo);
router.route("/:videoId").get(optJWT, getVideoById);
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo).delete(verifyJWT, deleteVideo);
router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
