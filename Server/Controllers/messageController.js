import ChannelModel from "../Models/channelModel.js";
import { sendError, sendResponse } from '../Utility/responseMessage.js';

export const sendMessage = async (req, res) => {
    const requestData = req.body;

    try {
        await ChannelModel.findOneDataAndUpdate(
            { _id: requestData.channelID },
            {
                $push: {
                    messages: requestData.messages
                }
            }
        );
    } catch (error) {
        sendError(res, {}, `Error while saving message data 😐`, false, 500);
    }
    sendResponse(res, {}, `Message sent successfully 😄`, true, 200);
}