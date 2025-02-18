/*
- createPlaylist,
getUserPlaylists,
- getPlaylistById,
- addVideoToPlaylist,
removeVideoFromPlaylist,
- deletePlaylist,
- updatePlaylist
*/

import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Playlist } from "../models/playlists.model.js";

const createPlaylist = asyncHandler( async (req , res) => {
    const { name , description } = req.body
    if(!(name.trim())){
        throw new ApiError(400 , "Playlist name required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
        videos: []
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            playlist,
            "Playlist created successfully"
        )
    )
})

const getPlaylistById = asyncHandler( async(req , res) => {
    const { playlistId } = req.params
    if(!playlistId){
        throw new ApiError(400 , "Playlist id cannot be empty in params")
    }
    const playlist = await Playlist.findById(playlistId)

    return res
    .status(200)
    .json(
       new ApiResponse( 200,
        playlist,
        "Playlist fetched successfully")
    )

})

const deletePlaylist = asyncHandler( async( req , res) => {
    const { playlistId } = req.params
    if(!playlistId){
        throw new ApiError(400 , "Playlist id cannot be empty in params")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            deletedPlaylist,
            "Playlist deleted successfully")
    )
})

//check the scope in updated playlist
const updatePlaylist = asyncHandler( async ( req , res) => {
    const { playlistId } = req.params
    if(!playlistId){
        throw new ApiError(400 , "Playlist id cannot be empty in params")
    }
    
    const { name , description } = req.body
    if(!(name && description)){
        throw new ApiError(400 , "New name or description required for updation")
    }
    

    
    const updatedPlaylist = await Playlist.findByIdAndUpdate({name , description}, {new:true})
    
    return res
    .status(200)
    .json(
        200,
        updatedPlaylist,
        "Playlist deleted successfully"
    )

})

const addVideoToPlaylist = asyncHandler( async (req , res) => {
    const {playlistId , videoId} = req.params
    if(!(playlistId && videoId)){
        throw new ApiError(400 , "Playlist id required in params")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $addToSet: { videos: videoId } }, // Prevents duplicate entries
        { new: true }
    );


   return res.status(200).json( new ApiResponse(200 , updatedPlaylist , "Video added successfully") )

})



export {
    createPlaylist,
    getPlaylistById,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist
}