import { Router } from "express";
import { toggleSubscription, getSubscribedChannels } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // all subscription routes require login

// subscribe or unsubscribe from a channel
router.route("/c/:channelId").post(toggleSubscription);

// get all channels the logged in user has subscribed to
router.route("/").get(getSubscribedChannels);

export default router;
