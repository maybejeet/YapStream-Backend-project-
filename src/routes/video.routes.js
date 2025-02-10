//router , upload , verify?
import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    publishAVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    getAllVideos,
    deleteVideo
 } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router()

videoRouter.route("/publish").post(verifyJWT, 
    upload.fields([{
        name: "videoFile",
        maxCount: 1
    },{
        name: "thumbnail",
        maxCount: 1
    }
]), publishAVideo
)
videoRouter.route("/c/:videoId").get(getVideoById)
videoRouter.route("/update/c/:videoId").post(verifyJWT , upload.single("thumbnail") , updateVideo)
videoRouter.route("/toggle-publish/c/:videoId").get(verifyJWT , togglePublishStatus)
videoRouter.route("/get-all-videos").get(verifyJWT , getAllVideos)
videoRouter.route("/delete-video/c/:videoId").delete(verifyJWT , deleteVideo)


export default videoRouter