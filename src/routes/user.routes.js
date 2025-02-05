import { Router } from "express";
import { changeFullName, changeUserName, getCurrentUser, getUserChannelProfile, loginUser, logOutUser, RefreshAccessToken, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const userRouter = Router()

userRouter.route("/register").post( //middleware injection in middle
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },{
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)
userRouter.route("/login").post(loginUser)
userRouter.route("/logout").post( verifyJWT ,logOutUser)
userRouter.route("/refresh-token").post(RefreshAccessToken)
userRouter.route("/change-password").post(verifyJWT , changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT , getCurrentUser)
userRouter.route("/change-username").patch(verifyJWT , changeUserName)
userRouter.route("/change-fullname").patch(verifyJWT , changeFullName)

userRouter.route("/change-avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)

userRouter.route("/c/:userName").get(verifyJWT , getUserChannelProfile)



export default userRouter