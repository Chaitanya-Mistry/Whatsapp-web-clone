import { useContext } from "react";
import { AppContext } from "../App";

export const Message = ({ messageData, newMessage}) => {
    const { loggedInUserData } = useContext(AppContext); // To get logged in user's details
    // console.log(messageData )
    return (
        <div className={messageData.senderEmail === loggedInUserData.email ? "myMessageDiv messageDiv" : "messageDiv"} id={newMessage ? 'newMessage' : ''}>
            <p className={messageData.senderEmail === loggedInUserData.email ? "myMessage message" : "message"}>
                {messageData.message}
            </p>
        </div>
    )
}