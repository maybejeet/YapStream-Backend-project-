/* 
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
*/

import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/likes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const toggleCommentLike = asyncHandler(async (req , res) => {

    const { commentId } = req.params
    if(!(commentId)){
        throw new ApiError (400 , "Id reference cannot be blank in params")
    }

    const LikedAlready = await Like.findOne({
        likedBy: req.user?._id,
        comment: commentId
    })
    if(LikedAlready){
        return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            LikedAlready,
            "Unliked comment"
        )
    )
    }
    

    const likeOnComment = await Like.create({
        likedBy: req.user?._id,
        comment: commentId
    })

    
    const likedComment = await Like.aggregate([
        {
         $match: { comment: new mongoose.Types.ObjectId(commentId) }   
        },
        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "commentDetails"
            }
        },
        {
            $unwind : "$commentDetails"
        },
        {
            $project: {
                likedBy: 1,
                "commentDetails._id": 1
            }
        }
    ])
 
     return res.status(200).json( new ApiResponse(200 , likedComment , "Comment liked successfully") )

})

const toggleTweetLike = asyncHandler(async (req , res) => {
    
    
    const { tweetId } = req.params
    if(!(tweetId)){
        throw new ApiError (400 , "Id reference cannot be blank in params")
    }

    const LikedAlready = await Like.findOne({
        likedBy: req.user?._id,
        tweet: tweetId
    })
    if(LikedAlready){
        return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            LikedAlready,
            "Unliked Tweet"
        )
    )
    }
    

    const likeOnTweet = await Like.create({
        likedBy: req.user?._id,
        tweet: tweetId
    })

    
    const likedTweet = await Like.aggregate([
        {
         $match: { tweet: new mongoose.Types.ObjectId(tweetId) }   
        },
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetDetails"
            }
        },
        {
            $unwind : "$tweetDetails"
        },
        {
            $project: {
                likedBy: 1,
                "tweetDetails._id": 1
            }
        }
    ])

     return res.status(200).json( new ApiResponse(200 , likeOnTweet , "Tweet liked successfully") )

})

const toggleVideoLike = asyncHandler( async (req , res) => {
       
    const { videoId } = req.params
    if(!(videoId)){
        throw new ApiError (400 , "Id reference cannot be blank in params")
    }

    const LikedAlready = await Like.findOne({
        likedBy: req.user?._id,
        video: videoId
    })
    if(LikedAlready){
        return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            LikedAlready,
            "Unliked video"
        )
    )
    }

    const likeOnVideo = await Like.create({
        likedBy: req.user?._id,
        video: videoId
    })

    
    const likedVideo = await Like.aggregate([
        {
         $match: { video: new mongoose.Types.ObjectId(videoId) }   
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind : "$videoDetails"
        },
        {
            $project: {
                likedBy: 1,
                "videoDetails._id": 1
            }
        }
    ])

     return res.status(200).json( new ApiResponse(200 , likeOnVideo , "Video liked successfully") )

}) 

const getLikedVideos = asyncHandler( async (req , res) => {
    // const { userId } = req.user?._id
    // if(!userId){
    //     throw new ApiError(400 , "UserId Invalid")
    // }

    const likedVideos = await Like.aggregate([
        {
            $match: { likedBy : new mongoose.Types.ObjectId(req.user?._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",

            }
        },
        { $unwind: "$videoDetails" }
        ,
        {
            $project: {
                _id: 1,
                "videoDetails._id":1,

            }
        }
        
    ])


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            likedVideos,
            "All liked videos fetched"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos

}

/*
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { Like } from "../models/likes.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const toggleLike = asyncHandler(async (req, res, type) => {
    const { id } = req.params;
    if (!id) throw new ApiError(400, "Id reference cannot be blank in params");

    const query = { likedBy: req.user?._id, [type]: id };

    const existingLike = await Like.findOne(query);
    
    if (existingLike) {
        await Like.deleteOne(query);
        return res.status(200).json(new ApiResponse(200, null, `${type} unliked successfully`));
    }

    await Like.create(query);

    const likedItem = await Like.aggregate([
        { $match: { [type]: new mongoose.Types.ObjectId(id) } },
        {
            $lookup: {
                from: `${type}s`,
                localField: type,
                foreignField: "_id",
                as: `${type}Details`
            }
        },
        { $unwind: `$${type}Details` },
        { $project: { likedBy: 1, [`${type}Details._id`]: 1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, likedItem, `${type} liked successfully`));
});

const toggleCommentLike = asyncHandler(async (req, res) => toggleLike(req, res, "comment"));
const toggleTweetLike = asyncHandler(async (req, res) => toggleLike(req, res, "tweet"));
const toggleVideoLike = asyncHandler(async (req, res) => toggleLike(req, res, "video"));

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        { $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id) } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" }
    ]);

    return res.status(200).json(new ApiResponse(200, likedVideos, "All liked videos fetched"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
*/