import { useContext, useEffect, useState } from "react";
import { ChatContext } from "./Home";
import { Message } from "./MessageComponent";
import EmojiPicker from "emoji-picker-react"; // Emoji Picker Library 😃
import { AppContext } from "../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const ConversationComponent = () => {
    const { selectedFriend, setContactList, contactList, setShowChat, setHideChatForMobile } = useContext(ChatContext); // to display current selected conversation.
    const [showEmojiPicker, setEmojiPicker] = useState(false); // to display/hide emoji picker.
    const [userInput, setUserInput] = useState(""); // To store user input box value
    const [messages, setMessages] = useState(""); // To store messages/conversation
    const { loggedInUserData, socketConnection } = useContext(AppContext); // To get logged in user's details
    const extractedMessages = [];
    const [currentChannelID, setCurrentChannelID] = useState(""); // To store current channel's id 
    const navigate = useNavigate();

    // Update Message UI 
    const updateMessageList = (latestMessage) => {
        setMessages([...messages, latestMessage]);
    }

    // Monitor updates from socket.io 🧐
    /*Received private messages*/
    socketConnection.off('private_message_receive').on("private_message_receive", (data) => {
        updateMessageList(data);
    });


    const isFriendPresentInContactList = (friendEmail) => {
        // Check whether sender's detail is present on left side (Contact Area)
        for (let i = 0; i < contactList.length; i++) {
            if (contactList[i].email === friendEmail) {
                return true;
            }
        }
        return false;
    }

    // Socket send message
    const sendMessageToSocket = (message) => {
        // Emit message to the socket.io 🔥
        socketConnection.emit('private_message', {
            to: selectedFriend.email,
            message: { ...message, name: loggedInUserData.name, profilePic: loggedInUserData.profilePic }
        });

        // Update user's contact list if this is a new friend
        const isFriendPresent = isFriendPresentInContactList(selectedFriend.email);

        if (!isFriendPresent) {
            // Update contact list if a message sent to new User/Friend 😉
            const latestContactList = [...contactList, selectedFriend];
            setContactList(latestContactList);
        }
    }

    // Capture previous messages fetched from database
    const captureMessages = (messages) => {
        for (let i = 0; i < messages.length; i++) {
            extractedMessages.push(messages[i]);
        }
    }

    const fetchConversation = async () => {
        let response;
        const baseURL = "http://localhost:4000/conversation";
        try {
            response = await axios.post(baseURL, {
                friendEmail: selectedFriend.email
            }, { withCredentials: true });
        } catch (err) {
            alert("Error:", err);
        }

        if (response.data.serverResponse.responseCode === 200) {
            const channelID = response.data.serverResponse.responseData[0]._id;
            setCurrentChannelID(channelID);

            for (let i = 0; i < response.data.serverResponse.responseData.length; i++) {
                captureMessages(response.data.serverResponse.responseData[i].messages);
            }
            // store conversation in state
            setMessages(extractedMessages);
            return channelID;
        } else {
            return false;
        }
    }

    // Mobile Friendly Chat 🔥
    const displayMobileFriendlyChat = () => {
        // Mobile Friendly Chat        
        const contactListComponent = document.getElementById("contactListComponent");
        const mobileConversationCSS = document.getElementById("conversationComponent");
        const chatBox = document.getElementById("chatBox");
        const friendProfileInfo = document.getElementById("friendProfileInfo");
        const endChat = document.getElementById("endChat");

        // Creating & adding Exit chat Element to DOM
        if (!endChat) {
            const createdExitChatElement = document.createElement("span");
            createdExitChatElement.textContent = "Exit chat ◀️ ";
            createdExitChatElement.setAttribute("id", "exitChat");

            // Attaching click event 
            createdExitChatElement.addEventListener("click", () => {
                // To go back to contact list ...
                setHideChatForMobile(true);
                setShowChat(false);
            });

            friendProfileInfo.appendChild(createdExitChatElement);
        }

        // First Hide contact list component 
        contactListComponent.style.display = "none";

        // 2nd display conversation component
        mobileConversationCSS.style.gridTemplateRows = "1fr 8fr 1fr";
        mobileConversationCSS.style.width = "100%";
        mobileConversationCSS.style.height = "100%";
    }

    // Browser's Width
    const checkBrowserWidth = () => {
        const data = parseInt(window.innerWidth);
        if (data <= 600) {
            displayMobileFriendlyChat();
        }
    }
    // Fetch Conversation on inital render of the component
    useEffect(() => {
        fetchConversation();
        // Check whether it's a mobile device or desktop device 🧐
        checkBrowserWidth();
    }, [selectedFriend]);

    // Send Message API 🔥
    const sendMessageAPI = async (createdChannelID, messageToSend) => {
        let sendMessageResponse;
        try {
            sendMessageResponse = await axios.post("http://localhost:4000/sendMessage", {
                channelID: createdChannelID,
                messages: {
                    senderEmail: loggedInUserData.email,
                    message: messageToSend
                }
            });
        } catch (err) {
            alert("Error: ", err);
        }
        return sendMessageResponse;
    }

    const sendMessageHandler = async (messageToSend) => {

        const continueChatID = await fetchConversation();
        if (continueChatID) {
            // Conversation continue ...
            const sendMessageResponse = await sendMessageAPI(continueChatID, messageToSend);

            if (sendMessageResponse.data.serverResponse.responseCode === 200) {
                // Clear input box by deleting values from state ...                        
                setUserInput("");
                // Change Message UI if user press "Enter" ⤵️ key
                // console.log("while sending 2nd message ...",messages);
                const messageObj = {
                    senderEmail: loggedInUserData.email,
                    message: messageToSend,
                    _id: new Date().getTime()
                }

                // Update UI
                updateMessageList(messageObj);
                // Socket Server 🔥
                sendMessageToSocket(messageObj);

            } else {
                alert("Error: ", sendMessageResponse.data.serverResponse.message);
            }
        } else {
            // Create a new channel if this is a first conversation
            if (!messages || messages.length === 0) {
                let channelResponse;
                let createdChannelID;
                const channelUsers = [
                    {
                        email: loggedInUserData.email,
                        name: loggedInUserData.name,
                        profilePic: loggedInUserData.profilePic
                    }, {
                        email: selectedFriend.email,
                        name: selectedFriend.name,
                        profilePic: selectedFriend.profilePic
                    }
                ];

                // 1st create new channel & capture its _id; 🥇
                try {
                    channelResponse = await axios.post("http://localhost:4000/createChannel", { channelUsers });
                } catch (error) {
                    alert("Error: ", error);
                }

                if (channelResponse.data.serverResponse.responseCode === 201) {
                    createdChannelID = channelResponse.data.serverResponse.responseData._id;
                    setCurrentChannelID(createdChannelID)
                    console.log("Channel has been created ...");
                } else {
                    alert("Error:", channelResponse.data.serverResponse.message);
                }

                // 2nd add messages inside the created channel list 🥈
                const sendMessageResponse = await sendMessageAPI(createdChannelID, messageToSend);

                if (sendMessageResponse.data.serverResponse.responseCode === 200) {
                    // Clear input box by deleting values from state ...                        
                    setUserInput("");

                    const messageObj = {
                        senderEmail: loggedInUserData.email,
                        message: messageToSend,
                        _id: new Date().getTime()
                    }

                    // Update UI
                    updateMessageList(messageObj);

                    // Socket Server 🔥
                    sendMessageToSocket(messageObj);
                } else {
                    alert("Error: ", sendMessageResponse.data.serverResponse.message);
                }
            }
        }


    }

    return (
        <div id="conversationComponent" className="mobileConversation">
            {/* Dynamically generated ... */}
            {/* Friend Profile Header */}
            <div id="friendProfileInfo">
                {/* Profile Pic 🔴*/}
                <img src={selectedFriend.profilePic} alt={selectedFriend.name + "profile pic"} id="friendProfileImage" />
                <span id="friendName">{selectedFriend.name}</span>
            </div>

            {/* Message Container */}
            <div id="messageContainer">
                {/* Dynamic rendered messages 💌 */}
                {
                    messages ? messages.map((currentMessage, index) => <Message messageData={currentMessage} key={currentMessage._id} />) : ""
                }
            </div>

            {/* Chatbox */}
            <div id="chatBox">
                {/* Emoji Picker */}
                {
                    showEmojiPicker ?
                        <div id="emojiPicker">
                            <EmojiPicker width={400} height={400} theme="dark" lazyLoadEmojis={true} emojiStyle="native" onEmojiClick={({ emoji }) => {
                                setUserInput(userInput + emoji); // To append emoji to input box with the help of state .
                            }} />
                        </div>
                        : ""
                }
                <span id="emojiPickerSymbol" onClick={() => {
                    setEmojiPicker(!showEmojiPicker); // Hide/Show Emoji Picker ...
                }}>😃</span>
                {/* Input */}
                <input type="text" value={userInput || ""}
                    // click event 
                    onClick={() => setEmojiPicker(false) // To hide emoji picker when user again click on input box ..
                    }
                    // input box change value event 
                    onChange={({ target }) => setUserInput(target.value)}
                    // key down event on input box 👇
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            sendMessageHandler(event.target.value);
                        }
                    }}
                    placeholder="Type a message" id="chatInput" />
            </div>
        </div>
    )
}
