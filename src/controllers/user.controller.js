import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/users.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}

    } catch (error) {
        console.log(error);        
        throw new ApiError(500, "Error while generating tokens")
    }
}

const registerUser  = asyncHandler ( async (req, res) => {
    const {userName , fullName , email , password}  = req.body
    if([fullName , userName , email , password].some((field) => field?.trim() === ""))
        {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email} , {userName}]
    })
    if(existedUser){
        throw new ApiError(409, "User with this username or email exists")
        
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0].path
    // console.log(avatarLocalPath);
    // console.log(coverImageLocalPath);
    
    if(!avatarLocalPath){
        throw new ApiError(401, "Avatar file does not exist")
    }
    const avatar = await uploadonCloudinary(avatarLocalPath)
        if (!avatar) {
            throw new ApiError(401, "Avatar file does not exist")
        }
    const coverImage = await uploadonCloudinary(coverImageLocalPath)


        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            password,
            userName: userName.toLowerCase(),
            email
        })
        if (!user) {
            throw new ApiError(402, "User creation failed",error) 
        }      

    
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering")
    }
    // console.log("created User" , createdUser);
    
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser , "User registered successfully")
        )

})

const loginUser = asyncHandler( async (req, res) => {
    const {email , userName , password} = req.body
    console.log(req.body);
    if(!(userName || email)){
        throw new ApiError(400,"Username or email is required")
    }
    const user = await User.findOne({
        $or: [{userName},{email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist.")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password while logging in")
    }
    console.log(user._id);
    
    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser , accessToken , refreshToken
            },
            "User loggedIn successfully"
        )
    )
})

const logOutUser = asyncHandler( async (req,res) => {
    
    await User.findByIdAndUpdate(req.user._id, {
        $set: {refreshToken: undefined}
    },{
        new: true
    })
    const options = {
        httpOnly: true,
        secure: true
    }
    
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,{},
            "User logged Out"
        )
    )
})

const RefreshAccessToken = asyncHandler( async (req,res)=>{
    //get the refresh token from cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401 , "Unauthorized request (Token did not match)")
    }
    try {
        //verify the incomingRefreshToken
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        //Mongodb se query laga ke user ka information lo
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401 , "Invalid refresh Token")
        }
        //check if the incoming refresh token from cookie and the from user are the same
        if(incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401, "Refresh token expired or used")
        }
        
        //if they matches then generate new tokens
        const options = {
            httpOnly: true,
            secure: true
        }
        
        const {accessToken, newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
        
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(
                200,
                {accessToken, newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
    
    
    
})

const changeCurrentPassword = asyncHandler( async (req, res)=>{
    const {oldPassword , newPassword } = req.body

    
    const user = await User.findById(req.user?._id)
    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isOldPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,{},
            "Password changed successfully"
        )
    )
})

const getCurrentUser = asyncHandler( async (req,res) => {
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully")
})

const changeUserName = asyncHandler( async (req , res) => {
    const {newUserName} = req.body
    if(!newUserName){
        throw new ApiError(401, "New Username required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        // {userName : newUserName},
        {
            $set:{userName: newUserName}
        },
        {new:true}
    ).select("-password")

    res.status(200).json(new ApiResponse(200, user , "username changed successfully"))
})

const changeFullName = asyncHandler( (req,res)=>{
    const {newFullName} = req.body
    if(!newUsenewFullNamerName){
        throw new ApiError(401, "New fullname required")
    }

    const user = User.findByIdAndUpdate(req.user?._id , {
        $set:{fullName: newFullName}
    },{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200 , user , "Full name changed successfully"))
})

const updateUserAvatar = asyncHandler( async (req,res)=>{
    //req.files when more than one entry
    //req.file for only one
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(401, "Avatar file missing")
    };
    const avatar = await uploadonCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(401, "Error while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{$set:{avatar: avatar.url}},{new:true}).select("-password")


    return res.status(200).json(new ApiResponse(200 , user , "Avatar changed successfully"))
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const {userName}  = req.params
    if(!userName?.trim()){
        throw new ApiError(401, "Username not found while getting channel profile")
    };

    // User.find({userName})
    const channel = await User.aggregate([
        {
            $match:{
                userName: userName?.toLowerCase()
            }
        },
        { //No. of subscribers , Number of channel that have subscribed to me
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        { //Channels i have subscribed to
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id , "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                email: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
            }
        }
    ])
    console.log("channel from aggregation" , channel);

    if(!channel.length){
        throw new ApiError(403 , "Channel does not exist")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0] , "User channel fetched successfully")
    )

})

const getWatchHistory = asyncHandler(async (req,res) => {

})

export {
    registerUser, 
    loginUser,
    logOutUser,
    RefreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    changeUserName,
    changeFullName,
    updateUserAvatar,
    getUserChannelProfile
}



/*
STEPS TO REGISTER(LOGIC):
1. ✅Take data from user - fullName , userName , email , password , avatar , coverImage
2. (Validation) 
✅ Not empty. 
✅ Check if user already exist. 
3. (Check for images) 
✅ Upload avatar and cover image on cloudinary. 
✅Check if uploaded on cloudinary
4. (Create user object) 
✅ Create the data-base with all credentials and url from cloudinary
5. ✅Remove password and refresh token field from response
6. ✅Check for user cretaion
7. ✅Return response
*/

/*
STEPS TO LOGIN USER:
1. ✅Take data 
    email or username (or both)
    take password
2. ✅Check if that user exists
3. ✅Check password for that user
4. ✅Generate tokens - access and refresh token
5. Send cookie
6. Response(200, success)
*/

/*
Access (Short lived)
Refresh token - Session storage (long lived) - stored in db
Endpoint hit karo and access token refresh karwa lo*/

/*
updating files -> multer middleware -> only for who is logged in
Take new avatar
Get user
upload on cloudinary
delete previous from cloudinary*/