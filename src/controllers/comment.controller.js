import mongoose from "mongoose"
import Comment from "../models/comment.model.js"
import Video from "../models/video.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/api.Response.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const {videoId} = req.params
    
    const {page = 1, limit = 10} = req.query

    if(!videoId){
        throw new apiError(400,"Video Id is Required")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video Not Found")
    }

    const pageNum = Number(page)
    const limitNum = Number(limit)

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                            avatar: 1
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                }
            }
        }
    ]

    if(req.user?._id){

        pipeline.push(
            {
                $addFields: {
                    isOwner: {
                        $eq: [
                            "$owner._id",
                            new mongoose.Types.ObjectId(req.user._id)
                        ]
                    },
                    isLiked: {
                        $in: [
                            new mongoose.Types.ObjectId(req.user._id),
                            "$likes.likedBy"
                        ]
                    }
                }
            }
        )
    }

    pipeline.push(
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: (pageNum - 1) * limitNum
        },
        {
            $limit: limitNum
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: 1,
                likesCount: 1,
                isOwner: 1,
                isLiked: 1
            }
        }
    )

    const comments = await Comment.aggregate(pipeline)

    return res.status(200).
    json(new apiResponse(200,comments,"Comments fetched successfully"))


})

const addComment = asyncHandler(async (req, res) => {
    
    const {videoId}=req.params
    
    if(!videoId){
        throw new apiError(400,"Invalid Video Id")
    }

    const video=await Video.findById(videoId)

    if(!video){
        throw new apiError(404,"Video not Found")
    }

    const {content}=req.body
    
    if(!content?.trim()){
        throw new apiError(400,"Comment is Required")
    }

    const {_id}=req.user

    if(!_id){
        throw new apiError(401,"User must be logged in")
    }

    const comment=await Comment.create({
        content,
        owner:_id,
        video:videoId
    })

    if(!comment){
        throw new apiError(401,"Couldnt Publish the comment")
    }

    return res.
    status(201).json(
    new apiResponse(201,comment,"Comment Published Successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    
    const {commentId}=req.params

    if(!commentId){
        throw new apiError(400,"Comment Id is Required")
    }

    const { content } = req.body;

    if (!content?.trim()) {
    throw new apiError(400, "Content is required");
    }

    const comment=await Comment.findById(commentId)

    if(!comment){
        throw new apiError(404,"Comment not found")
    }

    if(comment.owner.toString()!==req.user._id.toString()){
        throw new apiError(403,"Unauthorised Action")
    }

    const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    )

    if(!updatedComment){
        throw new apiError(401,"Comment not Updated")
    }

    return res.status(200).
    json(new apiResponse(200,updatedComment,"Comment Updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    
    const { commentId } = req.params

    if(!commentId){
        throw new apiError(400,"Invalid Comment Id")
    }
    
    const comment= await Comment.findById(commentId)

    if(!comment){
        throw new apiError(404,"Comment not Found")
    }

    if(comment.owner.toString()!==req.user._id.toString()){
        throw new apiError(403,"Unauthorised Action")
    }

    await Comment.findByIdAndDelete(commentId);

    return res.
    status(200).
    json(new apiResponse(200,{},"Comment Deleted Successfully"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }