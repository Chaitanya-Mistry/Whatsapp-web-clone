import { useContext } from "react"
import { ChatContext } from "./Home";

export const ContactItem = ({ userData }) => {

    const { setShowChat, setSelectedFriend } = useContext(ChatContext);
    return (
        <div className="contactItem" onClick={() => {
            // console.log("When user clicks particular contact ... ",userData)
            setSelectedFriend(userData); // to feed data into the conversation screen
            setShowChat(true); // To display conversation screen
        }}>
            {/* Profile Pic 🔴*/}
            <img src={userData.profilePic} alt={userData.name + `'s profile pic`} className="profileImage" />

            {/* Other contact information */}
            <div className="contactInfo">
                {/* Name */}
                <span className="contactName">{userData.name}</span>

            </div>

        </div>
    )
}

