import mongoose, {isValidObjectId} from "mongoose"
import Video from "../models/video.model.js"
import User from "../models/user.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/api.Response.js"
import asyncHandler from "../utils/asyncHandler.js"
import uploadToCloudinary, {deleteFromCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    if(!userId){
        throw new apiError(400,"User Id is Required")
    }

    if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid User Id")
    }
    
    const user = await User.findById(userId)

    if(!user){
        throw new apiError(404,"User Not Found")
    }

    const matchStage = {
        owner: new mongoose.Types.ObjectId(userId)
    }

    if(req.user?._id?.toString() !== userId){
        matchStage.isPublished = true
    }

    let sort = {
    createdAt: -1
}

    if(sortBy === "views"){
        sort = {
            views: -1
        }
    }

    if(sortBy === "createdAt"){

        if(sortType === "asc"){
            sort = {
                createdAt: 1
            }
        }
        else{
            sort = {
                createdAt: -1
            }
        }

    }

    const userVideos =await Video.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup:{
                from:"subscriptions",
                foreignField:"channel",
                localField:"owner",
                as:"subscribers",
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                isSubscribed: req.user?._id
                ?{
                    $in:[req.user._id,"$subscribers.subscriber"]
                }
                :false
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField:"_id",
                localField:"owner",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first: "$owner"
                }
            }
        },
        {
            $sort: sort
        },
        {
            $skip: (Number(page) - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        },
        
        {
            $project:{
                videoFile:1,
                thumbnail:1,
                title:1,
                views:1,
                createdAt:1,
                owner:1,
                subscribersCount:1,
                isSubscribed:1,
            }
        }
        
    ])

    if(!userVideos.length){
        throw new apiError(404,"No Videos Found")
    }

    return res.status(200).json(new apiResponse(200,userVideos,"Video Fetched Successfully"))


})

const publishAVideo = asyncHandler(async (req, res) => {
    
    const { title, description } = req.body
    
    if(!title?.trim() || !description?.trim()){
        throw new apiError(400,"Title And Description Are Reuired")
    }

    const{ _id }= req.user

    if(!_id){
        throw new apiError(400,"Login Reuired")
    }

    const videoPath = req.files?.videoFile?.[0]?.path
    const thumbnailPath = req.files?.thumbnail?.[0]?.path

    if(!videoPath){
        throw new apiError(400,"Video is Required")
    }

    if(!thumbnailPath){
        throw new apiError(400,"Thumbnail is Required")
    }

    const video= await uploadToCloudinary(videoPath)

    if(!video?.url){
        throw new apiError(400,"Error while Uploading Video")
    }

    const thumbnail= await uploadToCloudinary(thumbnailPath)

    if(!thumbnail?.url){
        throw new apiError(400,"Error while Uploading Thumbnail")
    }

    const vidDetails= await Video.create({
        videoFile: video.url,
        videoPublicId: video.public_id,
        thumbnail: thumbnail.url,
        thumbnailPublicId: thumbnail.public_id,
        title: title?.trim(),
        description: description?.trim(),
        duration: video.duration,
        owner: _id,
    })

    if(!vidDetails){
        throw new apiError(400,"Couldn't Publish the Video")
    }

    return res.status(201).json(new apiResponse(201,vidDetails,"Video Uploaded Successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params
    
    if(!videoId){
        throw new apiError(400,"VideoId is Required")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid VideoId")
    }

    const videoDetails = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                subscribersCount: {
                    $size: "$subscribers"
                },
                isLiked: req.user?._id
                    ? {
                        $in: [
                            req.user._id,
                            "$likes.likedBy"
                        ]
                    }
                    : false,
                isSubscribed: req.user?._id
                    ? {
                        $in: [
                            req.user._id,
                            "$subscribers.subscriber"
                        ]
                    }
                    : false
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                owner: 1,
                likesCount: 1,
                isLiked: 1,
                subscribersCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!videoDetails.length){
        throw new apiError(404,"Couldn't Fetch the Video")
    }

    if(!videoDetails[0].isPublished && videoDetails[0].owner._id.toString() !== req.user?._id?.toString()){
        throw new apiError(403,"Video is not published")
    }

    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        }
    )

    if(req.user?._id){
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet:{
                    watchHistory: videoId
                }
            }
        )
    }

    return res
    .status(200)
    .json(new apiResponse(200, videoDetails[0], "Video fetched successfully"));

})

const updateVideo = asyncHandler(async (req, res) => {
    
    
    const { videoId } = req.params
    
    if(!videoId){
        throw new apiError(400,"VideoId is Required")
    }

    const { title, description } = req.body

    const thumbnailPath = req.file?.path

    if(!(title?.trim() || description?.trim() || thumbnailPath))
    {
        throw new apiError(400,"Changes in Video Details are Required")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid VideoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video Not Found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const updateFields = {}

    if(title?.trim()){
        updateFields.title = title.trim()
    }

    if(description?.trim()){
        updateFields.description = description.trim()
    }

    if(thumbnailPath){

        const thumbnail = await uploadToCloudinary(thumbnailPath)

        if(!thumbnail?.url){
            throw new apiError(500,"Error while Uploading Thumbnail")
        }

        // TODO: delete old thumbnail from cloudinary using video.thumbnailPublicId
        await deleteFromCloudinary(video.thumbnailPublicId)

        updateFields.thumbnail = thumbnail.url
        updateFields.thumbnailPublicId = thumbnail.public_id
    }

    const updateVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields
        },
        {
            new: true,
            runValidators: true
        }
    )

    if(!updateVideoDetails){
        throw new apiError(500,"Couldn't Update Video")
    }

    return res.status(200).json(new apiResponse(200,updateVideoDetails,"Video Details Updated Successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params

    if(!videoId){
        throw new apiError(400,"VideoId is Required")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid VideoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video Not Found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const deletedVideoFile = await deleteFromCloudinary(video.videoPublicId,"video")

    if(!deletedVideoFile || deletedVideoFile.result !== "ok"){
        throw new apiError(500,"Couldn't Delete Video File")
    }

    const deletedThumbnail = await deleteFromCloudinary(video.thumbnailPublicId)

    if(!deletedThumbnail || deletedThumbnail.result !== "ok"){
        throw new apiError(500,"Couldn't Delete Thumbnail")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deletedVideo){
        throw new apiError(500,"Couldn't Delete the Video")
    }

    return res
    .status(200)
    .json(new apiResponse(200,{},"Video Deleted Successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params

    if(!videoId){
        throw new apiError(400,"VideoId is Required")
    }

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid VideoId")
    }

    const video =await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video Not Found")
    }

    if(video.owner.toString()!==req.user._id.toString()){
        throw new apiError(403,"Forbidden Access")
    }

    const updatedDetails= await Video.findByIdAndUpdate(videoId,{
            $set:{
                isPublished: !video.isPublished
            }
        },
        {
            new:true
        }   
    )
    
    if(!updatedDetails){
        throw new apiError(500,"Couldn't Update Publish Status")
    }

    return res.status(200).json(new apiResponse(200,updatedDetails,"Publish Status Updated Successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}