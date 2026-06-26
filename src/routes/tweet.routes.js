import { Router } from "express";
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// create a new tweet
router.route("/").post(verifyJWT, createTweet);

// get all tweets of a user by userId
router.route("/user/:userId").get(getUserTweets);

// update | delete a tweet by tweetId
router.route("/:tweetId").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet);

export default router;
