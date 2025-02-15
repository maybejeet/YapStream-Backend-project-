
import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/videos.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addComment = asyncHandler(async (req , res) => {
    const { videoId } = req.params
    if(!(videoId.trim())){
            throw new ApiError(400 , "videoId is missing from params")
    }
    const Fetchedvideo = await Video.findById(videoId)
    if(!Fetchedvideo){
        throw new ApiError(400 , 'Video not found')
    }

    const { content } = req.body
    if(!content){
        throw new ApiError(400 , "Comment content missing")
    }

    const comment =  await Comment.create({
        content,
        owner : req.user?._id,
        video : Fetchedvideo?._id
        
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            comment,
            "Comment added successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req , res) => {
    const {commentId , videoId} = req.params
    if([commentId , videoId].some((field) => field.trim()) == ""){
        throw new ApiError(400 , "videoId or commentId is missing from params")
    }
    const fetchedVideo = await Video.findById(videoId)
    if(!fetchedVideo){
        throw new ApiError(400 , "Video for the comment does not exist")
    }

    const comment = await Comment.findById(commentId)
    if(!(comment.owner.equals(req.user?._id))){
        throw new ApiError(400 , "Unauthorized: Cannot delete someone else comment")
    }
        
         const Deletedcomment = await Comment.findByIdAndDelete(commentId)
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            Deletedcomment,
            "Comment deleted successfully"
        )
    )
}) 

const updateComment = asyncHandler(async (req, res) => {
    const {commentId , videoId} = req.params
    if([commentId , videoId].some((field) => field.trim()) == ""){
        throw new ApiError(400 , "videoId or commentId is missing from params")
    }
    const fetchedVideo = await Video.findById(videoId)
    if(!fetchedVideo){
        throw new ApiError(400 , "Video for the comment does not exist")
    }

    const comment = await Comment.findById(commentId)
    if(!(comment.owner.equals(req.user?._id))){
        throw new ApiError(400 , "Unauthorized: Cannot update someone else comment")
    }

    const {content} = req.body
    if(!(content.trim())){
        throw new ApiError(400 , "Updated comment is missing")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId , {content} , {new: true})
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            updatedComment,
            "Comment updated successfully"
        )
    )

})

const getVideoComments = asyncHandler(async (req , res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400 , "videoId invalid")
    }
     const videoReference = await Comment.aggregate([
            {
                $match:{
                   video: new mongoose.Types.ObjectId(videoId)
                } 
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videoref"
                }
            },
            {
                 $unwind: "$videoref"
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    "videoref._id": 1,
                    owner: 1
                }
            }
        ])

        return res
        .status(200)
        .json(
            new ApiResponse(200,
                videoReference,
                "Comments fetched successfully"
            )
        )
        
})
export {
    addComment,
    deleteComment,
    updateComment,
    getVideoComments
}

