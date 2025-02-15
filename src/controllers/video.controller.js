// getAllVideos , publishAVideo , getVideoById , updateVideo , deleteVideo , togglePublishStatus

import mongoose from "mongoose";
import { Video } from "../models/videos.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {v2 as cloudinary} from "cloudinary"


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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    console.log("req.params : " , req.params);
    console.log("videoId : " , videoId);

    if(!videoId?.trim()){
        throw new ApiError(400 , "videoId invalid" )
    }
    //TODO: get video by id
    
    const video = await Video.findById(videoId)
    
    return res.status(200).json(new ApiResponse(200 , video , "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title , description} = req.body 

    if([title,description].some((field) => field?.trim()=="")){
        throw new ApiError(401, "Type new title and description")
    }

    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(401, "Thumbnail file missing")
    };
    const thumbnail = await uploadonCloudinary(thumbnailLocalPath)
    if(!thumbnail.url){
        throw new ApiError(401, "Error while uploading thumbnail")
    }
    let video = await Video.findById(videoId)
    if(!(video._id.equals(req.user?._id))){
        throw new ApiError(400 , "Unauthorized : Cannot updated someone else video")
    }
    const oldThumbnail = video.thumbnail
    // console.log(oldThumbnail);
    
    if (oldThumbnail) {
        const oldThumbnailPublicId = oldThumbnail.split('/').pop().split('.')[0];
        console.log("Old thumbnail public id" , oldThumbnailPublicId);
         // Extracts Cloudinary public ID
        try {
            await cloudinary.uploader.destroy([oldThumbnailPublicId]);
            console.log("Old thumbnail deleted from Cloudinary");
        } catch (error) {
            // console.error("Error deleting old avatar:", error);
            throw new ApiError(500 , "Error deleting old thumbnail", error)
        }
    }
    video = await Video.findByIdAndUpdate(
        videoId,
        { title, description, thumbnail: thumbnail.url },
        { new: true }
    );

    if (!video) {
        throw new ApiError(500, "Failed to update video");
    }

    return res.status(200).json( new ApiResponse(200 , video , "Video details updated successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(500 , "Video from videoid not found")
    }

    const video = await Video.findByIdAndUpdate(videoId, {
        isPublished:false
    }, {new:true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Publish Status toggeled successfully"
        )
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if(!(page || limit).trim()){
        throw new ApiError(400 , "Please enter page and limit number")
    }

    //Everything from query comes as a string so converting it to number
    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    //skip
    const skip = (pageNumber - 1 )* limitNumber

    //filtering
    const filter = {}
    
    if(query){
        filter.$or = [
            {
                title : {$regex: query , $options: "i"}
            },
            {
                description : {$regex: query , $options: "i"}
            }
        ] //option "i" is for ignoring cases and regex used to match bits and chunks of texts
    }

    // Filter by user ID (if provided)
    if (userId) {
        filter.owner = new mongoose.Types.ObjectId(userId);
    }

    // Sorting
    const sortOrder = sortType === "asc" ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    // Fetch videos from db
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .populate("owner", "_id userName avatar"); // Fetch owner details (userId, username, avatar)

    // Get total video and pages count
    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limitNumber);
     console.log("Total number of videos found :",totalVideos);
     console.log("Total number of pages :",totalPages);
     console.log("Videos fetched",videos);
    
    

     
    return res.status(200).json(new ApiResponse(200 , videos , "Videos fetched successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    //deleted video by id from db
    //remove its videoFile and thumbnail from cloudinary
    if(!videoId){
        throw new ApiError(400 , "Enter a valid video id")
    }

    const video = await Video.findByIdAndDelete(videoId)
    if(!video){
        throw new ApiError(400 , "Video not found")
    }
    const videoUrl = video.videoFile
    const thumbnailUrl = video.thumbnail
    if(videoUrl){
        const deletedVideoPublicId = videoUrl.split('/').pop().split('.')[0]
        try {
            //await cloudinary.uploader.destroy([deletedVideoPublicId]);
            await cloudinary.api.delete_resources([deletedVideoPublicId],{ type: 'upload', resource_type: 'video' })
            console.log("video deleted from Cloudinary");
        } catch (error) {
            // console.error("Error deleting old avatar:", error);
            throw new ApiError(500 , "Error deleting video from cloudinary", error)
        }
    }
    if(thumbnailUrl){
        const deletedThumbnailPublicId = videoUrl.split('/').pop().split('.')[0]
        try {
            await cloudinary.uploader.destroy([deletedThumbnailPublicId]);
            console.log("Thumbnail deleted from Cloudinary");
        } catch (error) {
            // console.error("Error deleting old avatar:", error);
            throw new ApiError(500 , "Error deleting thumbnail from cloudinary", error)
        }
    }

    return res.status(200).json(
        new ApiResponse(200 , video , "Video deleted successfully")
    )

})

export {
    publishAVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    getAllVideos,
    deleteVideo
}
