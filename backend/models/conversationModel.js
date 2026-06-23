import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users",
        required:true
    },
    doctor:{
        type:mongoose.Schema.ObjectId,
        ref:"doctor",
        required:true
    },
    messages: {
      sender:{
        type: String,
        enum: ['doctor', 'user'],
        required: true
      },
      message:{
        type:String,
        required:true
      }
    }
},
{timestamps:true})

const conversationModel = mongoose.model("conversation",conversationSchema)
export default conversationModel;