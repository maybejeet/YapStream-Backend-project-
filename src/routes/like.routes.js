import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller.js";

const likeRouter = Router()

likeRouter.route("/like-comment/c/:commentId").post(verifyJWT , toggleCommentLike)
likeRouter.route("/like-tweet/c/:tweetId").post(verifyJWT , toggleTweetLike)
likeRouter.route("/like-video/c/:videoId").post(verifyJWT , toggleVideoLike)
likeRouter.route("/get-video-like/c/:videoId").get(verifyJWT , getLikedVideos)


export default likeRouter
