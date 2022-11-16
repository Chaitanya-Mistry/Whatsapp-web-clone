import UserModel from '../Models/userModel.js';
import { sendResponse, sendError } from "../Utility/responseMessage.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import path, { resolve, dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

let hashedPassword;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
        hashedPassword = bcrypt.hashSync(req.body.password, 10);

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
    const isUserExists = await UserModel.findOneData({ email });

    // if user is not exists
    if (!isUserExists) {
        return sendError(res, {}, `Invalid credentials 😑, you first need to register`, false, 401);
    } else {
        // Password comparison of that particular user ... 
        const isValidPassword = bcrypt.compareSync(password, isUserExists.password);

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

// Upload Profile Pic
const updateProfilePic = async (req, res) => {
    const { loggedInUserEmail } = req;
    const { myProfilePic } = req.files;       
    // let profileDirectoryPath = resolve("Public/Profile_Pics");
    let profileDirectoryPath = resolve("Public/Profile_Pics");

    let foundUser;

    try {
        foundUser = await UserModel.findOneData({
            email: loggedInUserEmail
        });
    } catch (error) {
        return sendError(res, {}, "Error on server while finding a user 😐", false, 500);
    }

    if (foundUser) {
        const oldProfilePic = foundUser.profilePic; // Store name of old user's profile image
        // First delete old associated profile pic of a user
        try {
            const filePathToDelete = resolve(`${profileDirectoryPath}`,`${oldProfilePic}`);            

            // Only Remove profile pic if there is no default profile pic is set 
            if (!oldProfilePic.includes("http")) {
                fs.unlinkSync(filePathToDelete); // delete file from the system
            }
        }
        catch (err) {
            return sendError(res, {}, `${err} while deleting an old profile pic`, false, 500);
        }

        // 2nd move uploaded profile pic to particular folder ... 📬
        const currentTimeStamp = new Date().getTime();
        
        profileDirectoryPath = resolve(`${profileDirectoryPath}`+'/'+`${currentTimeStamp}_${myProfilePic.name}`);        
        try {

            await myProfilePic.mv(`./Public/Profile_Pics/${currentTimeStamp}_${myProfilePic.name}`), function (err) {
                if (err) {                    
                    return sendError(res, {}, `${err} while moving user's profile pic`);
                }
            };

        } catch (err) {
            return sendError(res, {}, `${err} while moving user's profile pic`, false, 500);
        }

        // Finally update reference in user's database ...
        let updateUserProfile;
        try {
            updateUserProfile = await UserModel.findOneDataAndUpdate({ email: loggedInUserEmail }, {
                profilePic: `${currentTimeStamp}_${myProfilePic.name}`
            });
        } catch (err) {
            sendError(res, {}, `${err} while updating user's profile pic reference in database ...`, false, 500);
        }

        if (updateUserProfile) {
            sendResponse(res, updateUserProfile, `Your profile pic updated successfully... 💚`, true, 200);
        }
    }
    else {
        sendError(res, {}, "Cannot find a user 😐", false, 204);
    }
}

export { createUser, loginUser, searchUser, updateProfilePic, logout };
