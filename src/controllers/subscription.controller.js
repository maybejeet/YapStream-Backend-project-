//toggleSubscription , getUserChannelSubscribers , getSubscribedChannels

import mongoose from "mongoose";
import { Subscription } from "../models/subscriptions.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const toggleSubscription = asyncHandler(async (req , res) => {
    const { userId } = req.params
    if(!userId){
        throw new ApiError(400 , "User id missing from params")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: userId,
    });
    if (existingSubscription) {
        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    }

    const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel: userId
    })

    const channelSubscribedTo = await Subscription.aggregate([
        {
            $match: { _id: subscription._id },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelInfo",
            },
        },
        {
            $unwind: "$channelInfo",
        },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                channel: "$channelInfo._id",
                channelName: "$channelInfo.name",
            },
        },
    ]);
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        channelSubscribedTo,
        "Subscribed successfully"
    )
    )

})

const getUserChannelSubscribers = asyncHandler( async (req , res) => {

    const UserChannelSubscribers = await Subscription.aggregate([
        {
            $match: { channel: req.user?._id }
        },
        {
            $lookup: {
                from : "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $unwind: "$subscribers"
        },
        {
            $project: {
                _id : 1,
                "subscribers._id":1,
                "subscribers.userName":1,
                channel:1
            }
        }
    ])
    console.log(UserChannelSubscribers);
    
    return res
    .status(200)
    .json(
        new ApiResponse( 200 ,UserChannelSubscribers , "Subscribers fetched successfully" )
    )

})

const getSubscribedChannels = asyncHandler( async (req , res) => {
    
    const SubscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: req.user?._id }
        },
        {
            $lookup: {
                from : "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $unwind: "$channels"
        },
        {
            $project: {
                _id : 1,
                "channels._id":1,
                "channels.userName":1,
                subscriber:1
            }
        }
    ])

    
    return res
    .status(200)
    .json(
        new ApiResponse( 200 ,SubscribedChannels , "Subscribers fetched successfully" )
    )
} )

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}