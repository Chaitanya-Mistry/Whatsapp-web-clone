import yup from "yup";
import { sendError } from "./responseMessage.js";
import UserModel from "../Models/userModel.js";
import jwt from "jsonwebtoken";

// Create User
const validateCreateUser = async (req, res, next) => {
    const userObjSchema = yup.object().shape({
        name: yup.string().required(),
        password: yup.string().required().length(6),
        email: yup.string().required(),
        profilePic: yup.string(),
    });

    await validate(userObjSchema, req.body, res, next);
}

// User Login
const loginValidation = async (req, res, next) => {
    const loginSchema = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().required()
    });

    await validate(loginSchema, req.body, res, next);
}

// User Logout
const logoutValidation = async (req, res, next) => {
    let foundUser;
    try {
        const token = req.cookies.jwtoken;
        // Verify token
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        foundUser = await UserModel.findOneData({ _id: verifyToken.user_id }); // Extract user's ID from JWT 
    } catch (err) {
        sendError(res, {}, `Unathorized : Token was not provided ..😒`, false, 401);
    }

    if (foundUser) {
        req.rootUser = foundUser;
        req.userID = foundUser._id;
        next();
    } else {
        sendError(res, {}, `Unathorized : Token was provided but user data is tempered ..😒`, false, 401);
    }
}

// Get Channel List
const channelListsValidation = async (req, res, next) => {
    const schema = yup.object().shape({
        email: yup.string().email().required()
    });

    await validate(schema, req.query, res, next);
}

// Search User
const searchUserValidate = async (req, res, next) => {
    const schema = yup.object().shape({
        email: yup.string().email().required(),
    });

    await validate(schema, req.query, res, next);
}
// Create Channel
const createChannelValidate = async (req, res, next) => {
    const schema = yup.object().shape({
        channelUsers: yup.array().of(
            yup.object().shape({
                email: yup.string().email().required(),
                name: yup.string().required(),
                // profilePic: yup.string()
            })
        ).length(2).required(),
    });

    await validate(schema, req.body, res, next);
}

// Conversation
const conversationValidate = async (req, res, next) => {
    const schema = yup.object().shape({
        friendEmail: yup.string().email().required()
    });

    await validate(schema, req.body, res, next);
}

// Send Message
const sendMessageValidate = async (req, res, next) => {
    const schema = yup.object().shape({
        channelID: yup.string().required(),
        messages: yup.object().shape({
            senderEmail: yup.string().email().required(),
            message: yup.string().required()
        })
    });
    await validate(schema, req.body, res, next);
}

// Validate 
const validate = async (schema, reqData, res, next) => {
    try {
        await schema.validate(reqData, { abortEarly: false });
        next();
    } catch (e) {
        // console.log("Inside erro 😅");
        const errors = e.inner.map(({ path, message, value }) => ({
            path,
            message,
            value
        }));
        sendError(res, errors, "Invalid user data");
    }
}

export {
    validateCreateUser,
    loginValidation,
    channelListsValidation,
    searchUserValidate,
    createChannelValidate,
    sendMessageValidate,
    logoutValidation,
    conversationValidate
}