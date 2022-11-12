import { ContactItem } from "./ContactItem"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../App";
import { ChatContext } from "./Home";

export const ContactListComponent = () => {
    const navigate = useNavigate();
    const { contactList, setContactList } = useContext(ChatContext); // to display current selected conversation.
    const [searchedUser, setSearchedUser] = useState(""); // To store searched user ...
    const { setLogIn, setLoggedInUserData, loggedInUserData, socketConnection } = useContext(AppContext);

    // Listen for messages 🌾
    const isSenderPresentInContactList = (senderEmail) => {
        // Check whether sender's detail is present on left side (Contact Area)
        for (let i = 0; i < contactList.length; i++) {
            if (contactList[i].email === senderEmail) {
                return true;
            }
        }
        return false;
    }

    // Monitor updates from socket.io 🧐
    /*Received private messages*/
    socketConnection.off('private_message_receive').on("private_message_receive", (data) => {
        console.log(data)
        const isSenderPresent = isSenderPresentInContactList(data.senderEmail);

        if (!isSenderPresent) {
            // To store sender's personal details
            const senderObj = {
                email: data.senderEmail,
                name: data.name,
                profilePic: data.profilePic
            }
            // Update contact list if a message came from new User/Friend 😉
            const latestContactList = [...contactList, senderObj];
            setContactList(latestContactList);
            // Show notification to user 🎶
            alert(`🆕 New friend: ${senderObj.email} messaged you ...`);
        }
    });

    // Logout process
    const logout = async () => {
        let response;
        const baseURL = "http://localhost:4000/logout";
        try {
            response = await axios.get(baseURL, { withCredentials: true });
        } catch (err) {
            response = err.response;
        }

        if (response.data.serverResponse.responseCode === 200) {
            alert(`${response.data.serverResponse.message}`);
            // Update state of our app
            setLogIn(false);
            setLoggedInUserData("");
            navigate('/'); // Navigate to default home page after log out ...
        } else {
            alert(`🟥 ERROR 🟥 ${response.data.serverResponse.message}`);
        }
    }

    // Change Profile Pic 🖌️
    const editProfilePic = () => {
        // Display Edit Profile Pic component 
        navigate("/editProfilePic");
    }

    // Email Validation 📧
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    // Axios POST request to search friend 🔥
    const searchFriendByEmail = async (givenEmail) => {

        let response;
        try {
            response = await axios.get(`http://localhost:4000/searchUser?email=${givenEmail}`, { withCredentials: true });
        } catch (err) {
            alert("Error:", err);
        }

        if (response.data.serverResponse.responseCode === 200) {
            // Update state
            setSearchedUser(response.data.serverResponse.responseData);
        } else {
            alert(`🟥 ERROR 🟥: ${response.data.serverResponse.message}`);
        }
    }
    // Search Friend Handler 🧐 
    const searchFriendHandler = (event) => {
        const friendEmail = event.target.value; // Store user's input 
        // Call our API only if given email is valid 👮‍♀️
        const isValidEmail = validateEmail(friendEmail);

        // if given email is a valid email id 
        if (isValidEmail && friendEmail.endsWith(".com") && friendEmail !== "") {
            if (friendEmail !== loggedInUserData.email) {
                searchFriendByEmail(friendEmail);
            } else {
                alert("We haven't implemented Self Chat feature 😆");
                event.target.value = "";
            }
        } else {
            setSearchedUser("");
        }
    }
    return (
        <div id="contactListComponent">

            <div id="profileInfo">
                {/* Profile Pic 🔴*/}
                <img src={loggedInUserData.profilePic} alt={loggedInUserData.name + `'s profile pic`} id="myProfileImage" onClick={editProfilePic} />
                <p id="myName">{loggedInUserData.name}</p>
                <p id="logout" onClick={logout}>Logout</p>
            </div>

            {/* Search Box 🧐 */}
            <div id="searchFriendBox">
                {/* Input */}
                <input type="text" placeholder=" &#128269; Search friend 🧑‍🤝‍🧑" id="searchInput" onChange={searchFriendHandler} />
            </div>

            {/* All Contacts */}
            <div id="contacts" className="mobileConversationContactList">
                {
                    searchedUser ? <ContactItem userData={searchedUser} isSearchedUser={true} /> :
                        contactList ? contactList.map(currentUserData => <ContactItem userData={currentUserData} key={currentUserData.email} />) : <h3 style={{ textAlign: "center", marginTop: 20 }}>No contacts</h3>
                }
            </div>
        </div>
    )
}