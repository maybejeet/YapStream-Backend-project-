// createTweet , getUserTweets , updateTweets , deleteTweets

import mongoose from "mongoose";
import { Tweet } from "../models/tweets.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createTweet = asyncHandler( async (req , res) => {
    const { content } = req.body
    if(!content){
        throw new ApiError(400 , "Give some content for tweet")
    }
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400 , "Unauthorized user")
    }
    const tweet = await Tweet.create({
        content,
        owner: userId
    })


    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            tweet,
            "Tweet created successfully"
        )
    )
})

const updateTweets = asyncHandler( async (req , res) => {
    const { tweetId } = req.params
    if(!tweetId){
        throw new ApiError(400 , "Give valid tweet Id")
    }
    const { content } = req.body
    if(!content){
        throw new ApiError(400 , "Give some content for tweet")
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId ,{content},{new:true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Tweet Updated successfully"
        )
    )
})

const deleteTweets = asyncHandler( async (req , res) => {
    const { tweetId } = req.params
    if(!tweetId){
        throw new ApiError(400 , "Enter vaild tweet Id")        
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId , {new:true})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            deletedTweet,
            "Tweet deleted successfully"
        )
    )

})

const getUserTweets = asyncHandler( async (req , res) => {
    //pipeline
    const { userId } = req.params

    const userTweets = await Tweet.aggregate([
        {
            $match:  {owner : new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },{
            $unwind: "$ownerDetails" //converts ownerDetails array into object
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                "ownerDetails._id": 1,
                "ownerDetails.userName": 1,

            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            userTweets,
            "All tweets fetched successfully"
        )
    )
})

export {
    createTweet,
    updateTweets,
    deleteTweets,
    getUserTweets
}