import  express, { json } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
// import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";


//routes declaration
app.use("/vidtube-v2/api/v1/users" , userRouter)
app.use("/vidtube-v2/api/v1/videos" , videoRouter)
app.use("/vidtube-v2/api/v1/tweets" , tweetRouter)
app.use("/vidtube-v2/api/v1/comments" , commentRouter)
app.use("/vidtube-v2/api/v1/likes" , likeRouter)
app.use("/vidtube-v2/api/v1/subscription" , subscriptionRouter)


export { app }