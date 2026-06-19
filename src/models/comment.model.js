import mongoose,{Schema} from 'mongoose';
import User from './user.model.js';
import Video from './video.model.js';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema=new Schema(
    {
        content:{
            type:String,
            required:true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    },
    {
        timestamps:true,
    }
)

commentSchema.plugin(mongooseAggregatePaginate);
export default mongoose.model('Comment',commentSchema)