import dotenv from "dotenv"
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { ApiError } from './apiError.js';

dotenv.config({
    path: "./.env"
})

//configuration
cloudinary.config(
    {
        cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
        api_key:process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET,
    }
)

 // Upload an image
 const uploadonCloudinary = async function(localFilePath){
    try {
        
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        })
        console.log("File successfully uploaded on cloudinary");
        console.log("Response's url:" , response.url);
        // console.log("Response:" , response);   
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("THis is the error of cloudinary" , error);       
        throw new ApiError(400, "Error while uploading on cloudinary", error)
    }
 }

 export { uploadonCloudinary }