import mongoose, {isValidObjectId} from "mongoose"
import Like from "../models/like.model.js"
import Video from "../models/video.model.js"
import Comment from "../models/comment.model.js"
import Tweet from "../models/tweet.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/api.Response.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params

    if(!videoId){
        throw new apiError(400,"Video Id is Required")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid Video Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video Not Found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if(existingLike){

        await Like.findOneAndDelete({
            video: videoId,
            likedBy: req.user._id
        })

        return res
        .status(200)
        .json(new apiResponse(200,{},"Video Unliked Successfully"))

    }

    const newLike = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    if(!newLike){
        throw new apiError(500,"Couldn't Like Video")
    }

    return res
    .status(201)
    .json(new apiResponse(201,newLike,"Video Liked Successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    
    const { commentId } = req.params

    if(!commentId){
        throw new apiError(400,"Comment Id is Required")
    }

    if(!isValidObjectId(commentId)){
        throw new apiError(400,"Invalid Comment Id")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new apiError(404,"Comment Not Found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existingLike){

        await Like.findOneAndDelete({
            comment: commentId,
            likedBy: req.user._id
        })

        return res
        .status(200)
        .json(new apiResponse(200,{},"Comment Unliked Successfully"))

    }

    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    if(!newLike){
        throw new apiError(500,"Couldn't Like Comment")
    }

    return res
    .status(201)
    .json(new apiResponse(201,newLike,"Comment Liked Successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    
    const { tweetId } = req.params

    if(!tweetId){
        throw new apiError(400,"Tweet Id is Required")
    }

    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"Invalid Tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new apiError(404,"Tweet Not Found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike){

        await Like.findOneAndDelete({
            tweet: tweetId,
            likedBy: req.user._id
        })

        return res
        .status(200)
        .json(new apiResponse(200,{},"Tweet Unliked Successfully"))

    }

    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(!newLike){
        throw new apiError(500,"Couldn't Like Tweet")
    }

    return res
    .status(201)
    .json(new apiResponse(201,newLike,"Tweet Liked Successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video:{
                    $exists:true,
                    $ne:null
                }
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video"
            }
        },
        {
            $unwind:"$video"
        },
        {
            $lookup:{
                from:"users",
                localField:"video.owner",
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
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $project:{
                _id:0,
                videoId:"$video._id",
                videoFile:"$video.videoFile",
                thumbnail:"$video.thumbnail",
                title:"$video.title",
                duration:"$video.duration",
                views:"$video.views",
                createdAt:"$video.createdAt",
                owner:1
            }
        }
    ])

    if(!likedVideos.length){
        throw new apiError(404,"No Liked Videos Found")
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            likedVideos,
            "Liked Videos Fetched Successfully"
        )
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}