import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const subscriptionRouter = Router()

subscriptionRouter.route("/toggle-subscription/c/:userId").put(verifyJWT , toggleSubscription)
subscriptionRouter.route("/get-subscribers").get(verifyJWT , getUserChannelSubscribers)
subscriptionRouter.route("/get-channels").get(verifyJWT , getUserChannelSubscribers)

export default subscriptionRouter
