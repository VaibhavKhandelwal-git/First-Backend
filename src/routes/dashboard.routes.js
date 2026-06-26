import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // all dashboard routes require login

// get channel stats — total views, subs, videos, likes, comments and most viewed video
router.route("/stats").get(getChannelStats);

// get all videos uploaded by the logged in channel with pagination and sorting
router.route("/videos").get(getChannelVideos);

export default router;
