import mongoose,{Schema} from 'mongoose';
import User from './user.model.js';
import Video from './video.model.js';
import Comment from './comment.model.js';
import tweet from './tweet.model.js';

const likeSchema=new Schema(
    {
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref:"Comment"
        },
        tweet:{
            type:Schema.Types.ObjectId,
            ref:"Tweet"
        },
        likedBy:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
    },
    {
        timestamps:true,
    }
)

export default mongoose.model('Like',likeSchema)
