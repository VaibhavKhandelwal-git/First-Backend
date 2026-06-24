import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import apiError, {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import apiResponse from "../utils/api.Response.js"

const createTweet = asyncHandler(async (req, res) => {
    
    const{content} = req.body

    if(!content){
        throw new apiError(400,"Content is required")
    }

    const{_id} = req.user

    if(!_id){
        throw new apiError(400,"User Must be LoggedIn")
    }

    const tweet = await Tweet.create({
        content,
        owner:_id
    })

    if(!tweet){
        throw new apiError(500,"Tweet Couldn't be Created")
    }

    return res.status(201).
    json(new apiResponse(201,tweet,"Tweet Crtead Successfully"))

    
})

const getUserTweets = asyncHandler(async (req, res) => {
    
    const{_id}=req.user

    if(!_id){
        throw new apiError(400,"User Must be LoggedIn")
    }

    const tweets = await Tweet.find({owner: _id}).sort({createdAt: -1});

    if(!tweets){
        throw new apiError(500,"Couldn't Fetch User Tweets")
    }

    return res.status(200)
    .json(new apiResponse(200,tweets,"User Tweets Fetched Successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    
    const{tweetId}=req.params

    if(!tweetId){
        throw new apiError(400,"Tweet Id is Required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid Tweet Id")
    }

    const{_id}=req.user

    if(!_id){
        throw new apiError(400,"User mustbe Logged In")
    }

    const{content}=req.body

    if(!content?.trim()){
        throw new apiError(400,"Content Can't be Empty")
    }

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new apiError(404,"Tweet Dosent Exist")
    }

    if(tweet.owner.toString()!==_id.toString()){
        throw new apiError(403,"Unauthorised Access")
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,
        {
            $set:{
                content
            }
        },
        {
            new: true
        }
    )

    if(!updatedTweet){
        throw new apiError(500,"Tweet not Updated")
    }

    return res.status(200).
    json(new apiResponse(200,updatedTweet,"Tweet Updated"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    
    const{tweetId}=req.params

    if(!tweetId){
        throw new apiError(400,"Tweet Id is Required")
    }

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid Tweet Id")
    }

    const{_id}=req.user

    if(!_id){
        throw new apiError(400,"User mustbe Logged In")
    }

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new apiError(404,"Tweet Dosent Exist")
    }

    if(tweet.owner.toString()!==_id.toString()){
        throw new apiError(403,"Unauthorised Access")
    }
    
    await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).
    json(new apiResponse(200,{},"Tweet Deleted Successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}