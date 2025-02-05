import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type:String,
        required:true,
        trim:true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner"
    },
},{timestamps: true})

export const Comment = mongoose.model("Comment" , commentSchema)