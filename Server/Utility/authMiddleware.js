import UserModel from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import { sendError } from "./responseMessage.js";

export const authMiddleware = async (req, res, next) => {
    let foundUser;
    try {
        const token = req.cookies.jwtoken;
        // Verify token
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        foundUser = await UserModel.findOneData({ _id: verifyToken.user_id });
    } catch (err) {
        sendError(res, {}, `Unathorized : Token was provided but user data is tempered ..😒`, false, 401);
    }
    if (foundUser) {
        req.loggedInUserEmail = foundUser.email;
        next();
    } else {
        // return res.status(401).json({ message: `Unathorized : Token was provided but user data is tempered ..😒` });
        sendError(res, {}, `Unathorized : Token was provided but user data is tempered ..😒`, false, 401);
    }
}