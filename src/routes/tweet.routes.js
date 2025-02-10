import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createTweet,
    deleteTweets,
    getUserTweets,
    updateTweets
 } from "../controllers/tweet.controller.js";

const tweetRouter = Router()

tweetRouter.route("/create-tweet").post(verifyJWT , createTweet)
tweetRouter.route("/update-tweet/c/:tweetId").patch(verifyJWT , updateTweets)
tweetRouter.route("/delete-tweet/c/:tweetId").delete(verifyJWT , deleteTweets)
tweetRouter.route("/get-tweet/c/:userId").get(verifyJWT , getUserTweets)


export default tweetRouter