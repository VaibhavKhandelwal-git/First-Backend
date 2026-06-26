import mongoose from "mongoose"
import Video from "../models/video.model.js"
import Subscription from "../models/subscription.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/api.Response.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const {_id} = req.user

    if(!_id){
        throw new apiError(400,"Login Required")
    }

    const totalSubscribers = await Subscription.countDocuments({channel: _id})

    const videoStats = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"video",
                as:"comments"
            }
        },
        {
            $addFields:{
                likesCount:{ $size:"$likes" },
                commentsCount:{ $size:"$comments" }
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{ $sum:1 },
                totalViews:{ $sum:"$views" },
                totalLikes:{ $sum:"$likesCount" },
                totalComments:{ $sum:"$commentsCount" },
                mostViewedVideo:{
                    $push:{
                        _id:"$_id",
                        title:"$title",
                        thumbnail:"$thumbnail",
                        duration:"$duration",
                        views:"$views",
                        createdAt:"$createdAt",
                        likesCount:"$likesCount",
                        commentsCount:"$commentsCount",
                        isPublished:"$isPublished"
                    }
                }
            }
        },
        {
            $addFields:{
                mostViewedVideo:{
                    $first:{
                        $sortArray:{
                            input:"$mostViewedVideo",
                            sortBy:{ views:-1 }
                        }
                    }
                }
            }
        },
        {
            $project:{
                _id:0,
                totalVideos:1,
                totalViews:1,
                totalLikes:1,
                totalComments:1,
                mostViewedVideo:1
            }
        }
    ])

    if(!videoStats.length){
        return res.status(200).json(new apiResponse(200,{
            totalVideos:0,
            totalViews:0,
            totalLikes:0,
            totalComments:0,
            totalSubscribers,
            mostViewedVideo:null
        },"Channel stats fetched"))
    }

    videoStats[0].totalSubscribers = totalSubscribers

    return res
    .status(200)
    .json(new apiResponse(200, videoStats[0], "Channel stats fetched"))

})

const getChannelVideos = asyncHandler(async (req, res) => {

    const {_id} = req.user

    if(!_id){
        throw new apiError(400,"Login Required")
    }

    const { page = 1, sortBy = "createdAt", sortType = "desc" } = req.query

    const limit = 30

    let sort = { createdAt: -1 }

    if(sortBy === "views"){
        sort = { views: -1 }
    }

    if(sortBy === "createdAt"){
        sort = { createdAt: sortType === "asc" ? 1 : -1 }
    }

    const videos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $lookup:{
                from:"comments",
                localField:"_id",
                foreignField:"video",
                as:"comments"
            }
        },
        {
            $addFields:{
                likesCount:{
                    $size:"$likes"
                },
                commentsCount:{
                    $size:"$comments"
                }
            }
        },
        {
            $sort: sort
        },
        {
            $skip: (Number(page) - 1) * limit
        },
        {
            $limit: limit
        },
        {
            $project:{
                videoFile:1,
                thumbnail:1,
                title:1,
                description:1,
                duration:1,
                views:1,
                isPublished:1,
                createdAt:1,
                likesCount:1,
                commentsCount:1
            }
        }
    ])

    if(!videos.length){
        throw new apiError(404,"No Videos Found")
    }

    return res.status(200).json(new apiResponse(200,videos,"Videos Fetched Successfully"))

})

export {
    getChannelStats, 
    getChannelVideos
    }