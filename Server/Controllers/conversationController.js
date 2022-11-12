import ChannelModel from "../Models/channelModel.js";
import { sendError, sendResponse } from '../Utility/responseMessage.js';

// Get conversation
const getConversation = async (req, res) => {
    // Validate logged in user first 🔥

    const { loggedInUserEmail } = req;
    const { friendEmail } = req.body;

    let foundConversation;

    try {
        foundConversation = await ChannelModel.findData({
            $and: [{ "channelUsers.email": loggedInUserEmail }, { "channelUsers.email": friendEmail }]
        });
    } catch (error) {
        sendError(res, {}, "Error on server while finding a conversation 😐", false, 500);
    }

    if (foundConversation && foundConversation.length > 0) {
        sendResponse(res, foundConversation, "Successfully found a conversation 😄", true, 200);
    } else {
        sendError(res, {}, "Cannot find a conversation 😐", false, 204);
    }
}

export { getConversation }
