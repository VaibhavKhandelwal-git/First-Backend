import { Router } from "express";
import { toggleSubscription, getSubscribedChannels } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // all subscription routes require login

router.route("/c/:channelId").post(toggleSubscription);
router.route("/").get(getSubscribedChannels);

export default router;
