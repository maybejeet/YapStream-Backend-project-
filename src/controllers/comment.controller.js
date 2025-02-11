/*
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
*/

import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addComment = asyncHandler(async (req , res) => {
    const { videoId } = req.params
    // const validVideoId = await new mongoose.Types.ObjectId.isValid(videoId)
    if(!(videoId.trim())){
            throw new ApiError(400 , "videoId is missing from params")
    }

    const { content } = req.body
    if(!content){
        throw new ApiError(400 , "Comment content missing")
    }

    let comment =  await Comment.create({
        content,
        owner : req.user._id,
        
    })

    const userComment = await Comment.aggregate([
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
            as: "video"
        }
    },
    {
         $unwind: "$video"
    },
    {
        $addFields: {
            video: "$video._id"
        }
    },
    {
        $project: {
            _id: 1,
            content: 1,
            video: 1,
            owner: 1
        }
    }
])
console.log(userComment);
// console.log(comment);


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userComment,
            "Comment added successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req , res) => {
    const {commentId} = req.params
    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError (400 , "Comment not found")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            comment,
            "Comment deleted successfully"
        )
    )
}) 

export {
    addComment,
    deleteComment
}

/*
ADD COMMENT:
1. req.body se comment ka content lenge
2. Video ka reference bhi chaiye hoga. 
So, videoId -> ye lenge params me
3. Comment me video ka reference hoga (videoId)
Pipeline lagana hoga
4. Owner to req.user se mil jayga and iska bhi id Comment me add karenge
*/


// const videoReference = await Comment.aggregate([
//     {
//         $match:{
//            videoId: new mongoose.Types.ObjectId(videoId)
//         } 
//     },
//     {
//         $lookup: {
//             from: "videos",
//             localField: "video",
//             foreignField: "_id",
//             as: "videoref"
//         }
//     },
//     {
//          $unwind: "$videoref"
//     },
//     {
//         $project: {
//             _id: 1,
//             content: 1,
//             "videoref._id": 1,
//             owner: 1
//         }
//     }
// ])