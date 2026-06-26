import mongoose, {isValidObjectId} from "mongoose"
import Playlist from "../models/playlist.model.js"
import Video from "../models/video.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/api.Response.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {

    const {name, description} = req.body

    if(!name?.trim() || !description?.trim()){
        throw new apiError(400,"Name and Description are Required")
    }

    const {_id} = req.user

    if(!_id){
        throw new apiError(400,"Login Required")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: _id,
        videos: []
    })

    if(!playlist){
        throw new apiError(500,"Couldn't Create Playlist")
    }

    return res.status(201).json(new apiResponse(201,playlist,"Playlist Created Successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const {userId} = req.params

    if(!userId){
        throw new apiError(400,"User Id is Required")
    }

    if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid User Id")
    }

    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields:{
                videosCount:{ $size:"$videos" }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                videosCount:1,
                createdAt:1,
                updatedAt:1
            }
        }
    ])

    if(!playlists.length){
        throw new apiError(404,"No Playlists Found")
    }

    return res.status(200).json(new apiResponse(200,playlists,"Playlists Fetched Successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {

    const {playlistId} = req.params

    if(!playlistId){
        throw new apiError(400,"Playlist Id is Required")
    }

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
                    {
                        $match:{
                            isPublished: true
                        }
                    },
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{ $first:"$owner" }
                        }
                    },
                    {
                        $project:{
                            videoFile:1,
                            thumbnail:1,
                            title:1,
                            duration:1,
                            views:1,
                            createdAt:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{ $first:"$owner" },
                videosCount:{ $size:"$videos" }
            }
        },
        {
            $project:{
                name:1,
                description:1,
                videos:1,
                owner:1,
                videosCount:1,
                createdAt:1,
                updatedAt:1
            }
        }
    ])

    if(!playlist.length){
        throw new apiError(404,"Playlist Not Found")
    }

    return res.status(200).json(new apiResponse(200,playlist[0],"Playlist Fetched Successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new apiError(400,"Playlist Id and Video Id are Required")
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400,"Invalid Playlist Id or Video Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new apiError(404,"Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video Not Found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{ videos: videoId }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new apiError(500,"Couldn't Add Video to Playlist")
    }

    return res.status(200).json(new apiResponse(200,updatedPlaylist,"Video Added to Playlist"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new apiError(400,"Playlist Id and Video Id are Required")
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400,"Invalid Playlist Id or Video Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new apiError(404,"Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{ videos: new mongoose.Types.ObjectId(videoId) }
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new apiError(500,"Couldn't Remove Video from Playlist")
    }

    return res.status(200).json(new apiResponse(200,updatedPlaylist,"Video Removed from Playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {

    const {playlistId} = req.params

    if(!playlistId){
        throw new apiError(400,"Playlist Id is Required")
    }

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid Playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new apiError(404,"Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new apiError(500,"Couldn't Delete Playlist")
    }

    return res.status(200).json(new apiResponse(200,{},"Playlist Deleted Successfully"))

})

const updatePlaylist = asyncHandler(async (req, res) => {

    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId){
        throw new apiError(400,"Playlist Id is Required")
    }

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid Playlist Id")
    }

    if(!(name?.trim() || description?.trim())){
        throw new apiError(400,"Name or Description is Required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new apiError(404,"Playlist Not Found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const updateFields = {}

    if(name?.trim()) updateFields.name = name.trim()
    if(description?.trim()) updateFields.description = description.trim()

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updateFields
        },
        {
            new: true
        }
    )

    if(!updatedPlaylist){
        throw new apiError(500,"Couldn't Update Playlist")
    }

    return res.status(200).json(new apiResponse(200,updatedPlaylist,"Playlist Updated Successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
