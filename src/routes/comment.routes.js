import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
 } from "../controllers/comment.controller.js";

const commentRouter = Router()

commentRouter.route("/add-comment/c/:videoId").post(verifyJWT , addComment)
commentRouter.route("/delete-comment/c/:videoId/:commentId").delete(verifyJWT , deleteComment)
commentRouter.route("/update-comment/c/:videoId/:commentId").patch(verifyJWT , updateComment)
commentRouter.route("/get-comment/c/:videoId").get(verifyJWT , getVideoComments)


export default commentRouter