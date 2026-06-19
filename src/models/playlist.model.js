import mongoose,{Schema} from 'mongoose';
import User from './user.model.js';
import Video from './video.model.js';

const playlistSchema=new Schema(
    {
        name:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        videos:{
            type:[Schema.Types.ObjectId],
            ref:"Video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true,
    }
)

export default mongoose.model('Playlist',playlistSchema)