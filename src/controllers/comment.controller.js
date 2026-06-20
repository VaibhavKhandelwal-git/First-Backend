import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import apiError, {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
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
    new ApiResponse(201,comment,"Comment Published Successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }