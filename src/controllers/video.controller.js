// getAllVideos , publishAVideo , getVideoById , updateVideo , deleteVideo , togglePublishStatus

import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body
    if(!title){
        throw new ApiError(400 , "Video title missing")
    }
    if(!description){
        throw new ApiError(400 , "Video description missing")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!videoFileLocalPath){
        throw new ApiError(400 , "Video file does not exist")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400 , "Thumbnail file does not exist")
    }
    const videoFile = await uploadonCloudinary(videoFileLocalPath)
    const thumbnail = await uploadonCloudinary(thumbnailLocalPath)
    console.log(videoFile);

    //Video uploaded on cloudinary. Now i have to add the video to its users videoList and also publish the video.
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        views: 0, //will be added by frontend
        isPublished: false,
        owner: req.user._id
    })
    if (!video) {
        throw new ApiError(402, "Video not created" ,error) 
    } 
    // console.log("Req.user" ,req.user);
    //  Video.findById(video._id)
    
    await Video.findByIdAndUpdate(video._id, { isPublished: true }, { new: true });

    return res.status(200).json( new ApiResponse(200 , video , "Video Published Successfully"))
})



export {
    publishAVideo
}

























































/*
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})
*/

// const getVideoOwner = await Video.aggregate([
    //     {
    //         $match:{
    //             _id : new mongoose.Types.ObjectId(video._id)
    //         }
    //     },
    //     {
    //         $lookup:{
    //             from: "users",
    //             localField: "owner",
    //             foreignField: "_id",
    //             as: "ownerDetails"
    //         }
    //     },{
    //         $unwind: "$ownerDetails"
    //     },
    //     {
    //         $addFields: {
    //             owner: {
    //                 _id: "$ownerDetails._id",
    //                 userName: "$ownerDetails.userName"
    //             }
    //         }
    //     },
    //     {
    //         $project:{
    //             ownerDetails: 0 
    //         }
    //     }
    // ])
    // await video.isPublished = true