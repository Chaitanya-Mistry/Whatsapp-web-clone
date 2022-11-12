import ChannelModel from "../Models/channelModel.js";
import { sendError, sendResponse } from '../Utility/responseMessage.js';

// Channel creation
const createChannel = async (req, res) => {
    // NOTE : check if a channel is already created or not ...  
    const email1 = req.body.channelUsers[0].email;
    const email2 = req.body.channelUsers[1].email;

    let foundConversation;

    try {
        foundConversation = await ChannelModel.findData({
            $and: [{ "channelUsers.email": email1 }, { "channelUsers.email": email2 }]
        });
    } catch (error) {
        sendError(res, {}, "Error on server while finding a conversation 😐", false, 500);
    }

    if (foundConversation && foundConversation.length > 0) {
        sendResponse(res, foundConversation, "Successfully found a conversation 😄", true, 200);
    }
    // If it is not an old conversation ...
    else {
        const channel = new ChannelModel(req.body);
        try {
            await channel.saveData();
        } catch (error) {
            return sendError(res, {}, "Cannot create a channel 😐", false, 500);
        }
        return sendResponse(res, channel, "Successfully created a channel 👨‍🔧", true, 201);
    }
}


// Get a channel
const getChannelList = async (req, res) => {
    const { email } = req.query;

    let foundChannelList;
    try {
        foundChannelList = await ChannelModel.findData({
            "channelUsers.email": email
        });
    } catch (error) {
        sendError(res, {}, "Error on server while finding a channel 😐", false, 500);
    }

    if (foundChannelList) {
        sendResponse(res, foundChannelList, "Successfully found a channel 😄", true, 200);
    } else {
        sendError(res, {}, "Cannot find a channel 😐", false, 204);
    }
}

export { createChannel, getChannelList }
