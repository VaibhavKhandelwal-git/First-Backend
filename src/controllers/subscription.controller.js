import mongoose, {isValidObjectId} from "mongoose"
import User from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/api.Response.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    
    const {channelId} = req.params
    
    if(!channelId){
        throw new apiError(400,"Channel Id is Required")
    }

    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "Invalid Channel Id")
    }

    const channel=await User.findById(channelId)

    if(!channel){
        throw new apiError(404,"Channel Doesn't Exist")
    }

    const{_id}=req.user

    if(!_id){
        throw new apiError(400,"User Id is Required")
    }

    if (channelId.toString() === _id.toString()) {
        throw new apiError(400, "You cannot subscribe to your own channel");
    }
    
    const subinfo = await Subscription.findOne({
        subscriber: _id,
        channel: channelId
    }) 

    if(subinfo){
        await Subscription.findByIdAndDelete(subinfo._id)

    return res.status(200).json(new apiResponse(200,{},"Unsubscribed"))
    }

    await Subscription.create({
        subscriber: _id,
        channel: channelId
    })

    return res.status(200).json(new apiResponse(200,{},"Subscribed"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    const{_id}=req.user

    if(!_id){
        throw new apiError(400,"User Must be LoggedIn")
    }

    const subbedChannels= await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup:{
                from:"users",
                foreignField: "_id",
                localField: "channel",
                as: "channels",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channels"
        },
        {
            $sort:{
                "channels.username": 1
            }
        },
        {
            $project:{
                _id:"$channels._id",
                username:"$channels.username",
                avatar:"$channels.avatar",
            }
        }
    ])

    return res.status(200)
    .json(new apiResponse(200,subbedChannels,"Subscriptions fetched"))


})


export {
    toggleSubscription,
    getSubscribedChannels
}