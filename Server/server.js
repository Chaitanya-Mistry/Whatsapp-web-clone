import express from 'express';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import compression from 'compression';
import cors from "cors";
import cookieParser from 'cookie-parser';
import { authMiddleware } from './Utility/authMiddleware.js';
import { getConversation } from './Controllers/conversationController.js';
import { Server } from 'socket.io';
// Validation middlewares 🧐
import * as userCntl from "./Controllers/userController.js";
import * as channelCntl from "./Controllers/channelController.js";
import * as messageCntl from "./Controllers/messageController.js";
import * as Validation from "./Utility/validation.js";
import path from "path";
import fileUpload from 'express-fileupload';
import {fileURLToPath} from 'url';

const app = new express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares 🚩

app.use(cors({
    origin: 'http://localhost:3000', // Allowed domains to communicate with our api
    credentials: true
})
); // To allow our front-end to make requests to our API server ..

// To serve public files
app.use("/Profile_Pics", express.static(path.join(__dirname,"Public/Profile_Pics")));
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(fileUpload()); // To parse and access uploaded file with req.files
app.use(compression(9)); // Compression of data to speed up our Express app’s performance. 🔥
// The values range from 0 (no compression) to 9 (highest level of compression).
app.use(cookieParser()); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.

// Set up Global configuration access
dotenv.config();
const PORT = process.env.PORT || 4000; // Server PORT

// DB connection & Server Start ⭐
async function connectDBAndStartServer() {
    // DB options
    const dbOptions = {
        keepAlive: true
    }

    // To connect to the mongodb database & start the server after connection successfully established🗄️
    let dbConnection;
    let serverStarted;
    try {
        dbConnection = mongoose.connect(process.env.MongoDB_URI, dbOptions);
    } catch (err) {
        console.log("Error occured while connecing to the DB 😅", err);
    }

    if (dbConnection) {
        serverStarted = app.listen(PORT, () => {
            console.log(`Express is 🏃 on port ${PORT} `);
            console.log(`Express is connected to the database 😄`);
        });

        // Socket.IO

        const io = new Server(serverStarted, {
            pingTimeout: 60000,
            cors: {
                origin: "http://localhost:3000"
            }
        });

        // The Listen to register event on the server side to register user's socket to connected socket
        // An object to store connected user's email
        const connectedUsers = {};

        io.on("connection", socket => {
            /*Register connected users*/
            socket.on('register', userEmail => {
                socket.userEmail = userEmail;
                connectedUsers[userEmail] = socket;
                // console.log(userEmail, " Registered ...",socket.id);                
            });

            // Receive message and emit it to private user
            socket.on("private_message", (messageData) => {
                const to = messageData.to;
                const message = messageData.message;

                //  console.log("debugging :❤️‍🔥",messageData)                

                if (connectedUsers[to]) {
                    // Privately emit given message to the particular connected user                    
                    connectedUsers[to].emit('private_message_receive', message);
                }
            })

            socket.on("disconnect", () => {
                // console.log("Socket disconnected: ", socket.id)
                delete connectedUsers[socket.id];
            })
        });

        // io.on("connection", (socket) => {
        //     // console.log("Connected socket.io");

        //     // Join Chat Event
        //     socket.on("join chat", (channelID) => {
        //         socket.join(channelID);
        //         console.log("User joined room: ", channelID, "\n");
        //         socket.to("channelID").emit("some event");
        //     });

        //     socket.on("send message", (message) => {
        //         console.log("Message received from client : ", message);
        //         socket.broadcast.emit('new message',message);
        //     });

        // });
    }
}

connectDBAndStartServer();

// API ROUTES 👇

// Search user
app.get("/searchUser", Validation.searchUserValidate, userCntl.searchUser);
// Create User 
app.post("/createUser", Validation.validateCreateUser, userCntl.createUser);
// Log in 
app.post("/login", Validation.loginValidation, userCntl.loginUser);
// Logout
app.get('/logout', Validation.logoutValidation, userCntl.logout);
// Channel list
app.get("/channelList", Validation.channelListsValidation, channelCntl.getChannelList);
// Get Conversation 💬
app.post("/conversation", authMiddleware, Validation.conversationValidate, getConversation);
// Create Channel
app.post("/createChannel", Validation.createChannelValidate, channelCntl.createChannel);
// Send messages
app.post("/sendMessage", Validation.sendMessageValidate, messageCntl.sendMessage);
// Upload/Update Profile Pic
app.patch("/updateProfilePic", authMiddleware, userCntl.updateProfilePic);
