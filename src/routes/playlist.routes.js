import { Router } from "express";
import { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { optJWT } from "../middlewares/optionalAuth.middleware.js";

const router = Router();

// get all playlists of a user by userId
router.route("/user/:userId").get(optJWT, getUserPlaylists);

// get a single playlist by id
router.route("/:playlistId").get(optJWT, getPlaylistById);

// secured routes
// create a new playlist
router.route("/").post(verifyJWT, createPlaylist);

// update | delete a playlist by playlistId
router.route("/:playlistId").patch(verifyJWT, updatePlaylist).delete(verifyJWT, deletePlaylist);

// add a video to a playlist
router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);

// remove a video from a playlist
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

export default router;
