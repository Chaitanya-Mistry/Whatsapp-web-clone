const sendResponse = (res, data, msg, success, code, JWT) => {
    // if server wants to send json web token when user is trying to log in 
    if (JWT) {
        const responseObj = {
            responseData: data,
            message: msg,
            success,
            responseCode: code
        };
        // Sending cookie to the client 🍪
        return res.cookie("jwtoken", JWT, {
            // expires: new Date(Date.now() + 300000), // Expires after 5 minutes 
            // httpOnly: true // Prevents client-side scripts from accessing our token 👮
        }).status(200).json({ serverResponse: responseObj });
    } else {
        const responseObj = {
            responseData: data,
            message: msg,
            success,
            responseCode: code
        };

        // Converting responseObj into json format
        return res.json({ serverResponse: responseObj });
    }
}

const sendError = (res, data, msg = "Request Failed", success = false, code = 400) => {
    sendResponse(res, data, msg, success, code);
}

export { sendResponse, sendError };