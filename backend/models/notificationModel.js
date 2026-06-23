import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users",
        required:true
    },
    appointment:{
        type:mongoose.Schema.ObjectId,
        ref:"appointments",
    },
    message:{
        type:String,
        required:true
    },
    seen:{
        type:Boolean,
        default:false
    }
},{timestamps:true}
)

const notificationModel = mongoose.model("notifications",notificationSchema)
export default notificationModel;