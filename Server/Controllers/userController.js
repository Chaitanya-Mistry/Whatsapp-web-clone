import UserModel from '../Models/userModel.js';
import { sendResponse, sendError } from "../Utility/responseMessage.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

let hashedPassword;
// Create user
const createUser = async (req, res) => {
    // First check if user is already exist or not 
    let isUserExists;
    try {
        isUserExists = await UserModel.findOneData({ email: req.body.email })
    } catch (err) {
        sendError(res, "", "Error while checking for a duplicate user", false, 500);
    }

    // if user is already exists 😑
    if (isUserExists) {
        sendError(res, "", "You are already registered 😃, please login ...", false, 200);
    } else {
        // Hash User's Password ... 👮‍♂️
        hashedPassword = bcrypt.hashSync(req.body.password,10);

        const userObj = new UserModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });

        try {
            // Saving user data to the database 
            await userObj.saveData();
        } catch (err) {
            return sendError(res, {}, `Failed to create a user 🤐: ${err}`, false, 500);
        }

        return sendResponse(res, {}, `User with email: ${userObj.email} created successfully 😄`, true, 201);
    }
}

// Login 
const loginUser = async (req, res) => {

    // Token generation goes here 
    const generateToken = ({ _id }) => {
        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        const token = jwt.sign({ user_id: _id }, jwtSecretKey);
        return token;
    }

    const { email, password } = req.body;

    // Find user 
    const isUserExists = await UserModel.findOneData({email});

    // if user is not exists
    if (!isUserExists) {
        return sendError(res, {}, `Invalid credentials 😑, you first need to register`, false, 401);
    } else {
        // Password comparison of that particular user ... 
        const isValidPassword = bcrypt.compareSync(password,isUserExists.password);

        // IF password is valid ✅
        if (isValidPassword) {
            // Generating a JWT(Json Web Token) for user 🍪
            const token = generateToken(isUserExists);
            sendResponse(res, { email: isUserExists.email, name: isUserExists.name, profilePic: isUserExists.profilePic }, `Welcome, ${isUserExists.name} 😎`, true, 200, token);
        }
        // If password is NOT valid 🟥 
        else {
            sendResponse(res, {}, `Incorrect password 🙁`, false, 400);
        }
    }
}

// Logout
const logout = async (req, res) => {
    res.clearCookie('jwtoken'); // Remove JWT from client's cookie  
    sendResponse(res, {}, `${req.rootUser.name} successfully logout 👍`, true, 200);
}

// Search user
const searchUser = async (req, res) => {
    const { email } = req.query;

    // Check if a user exists or not 🧐
    let isUserExists;
    try {
        isUserExists = await UserModel.findOneData({ email });
    } catch (error) {
        sendError(res, email, `Error occured on the server 😑`, false, 500);
    }

    if (!isUserExists) {
        sendError(res, {}, `No user with email: ${email} found 😑`, false, 204);
    } else {
        sendResponse(res, { email: isUserExists.email, name: isUserExists.name, profilePic: isUserExists.profilePic }, `A user whose email: ${email} has been found 😄`, true, 200);
    }
}

export { createUser, loginUser, searchUser, logout };
