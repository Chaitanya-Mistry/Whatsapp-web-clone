import { createContext, useState, useContext, useEffect } from 'react';
import '../App.css';
import { ContactListComponent } from './ContactListComponent';
import { ConversationComponent } from './ConversationComponent';
import { Welcome } from './WelcomeComponent';
import axios from 'axios';
import { AppContext } from '../App';

const ChatContext = createContext();

function Home() {
    const [showChat, setShowChat] = useState(false);
    const [hideChatForMobile, setHideChatForMobile] = useState("");
    const [selectedFriend, setSelectedFriend] = useState("");
    const [contactList, setContactList] = useState("");
    const { loggedInUserData } = useContext(AppContext);
    const extractedChannelUsers = []; // To store channel users 

    // Capture Users 🕵️
    const captureChannelUsers = (users) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i].email !== loggedInUserData.email) {
                extractedChannelUsers.push(users[i]);
            }
        }
    }

    const fetchContactList = async () => {
        let response;
        try {
            response = await axios.get(`http://localhost:4000/channelList?email=${loggedInUserData.email}`);
        } catch (err) {
            alert("Error: ", err);
        }
        if (response.data.serverResponse.responseCode === 200) {

            const tempFetchedChannelData = response.data.serverResponse.responseData;

            // Extracting channel users from nested object 
            for (let i = 0; i < tempFetchedChannelData.length; i++) {
                // captureChannelUsers
                captureChannelUsers(tempFetchedChannelData[i].channelUsers);
            }
            // Update state of contact lists ...
            setContactList(extractedChannelUsers);
        }
    }

    // Inital Render
    useEffect(() => {
        fetchContactList();
    }, []);

    // ❤️‍🔥

    if(hideChatForMobile){
        return(
            <ChatContext.Provider value={{ setShowChat, setSelectedFriend, selectedFriend, contactList, setContactList, hideChatForMobile, setHideChatForMobile}}>

            <div id="container">
                <ContactListComponent />
                {showChat ? <ConversationComponent /> : <ContactListComponent />}
            </div>
        </ChatContext.Provider>
        )
    }else{
        return (

            <ChatContext.Provider value={{ setShowChat, setSelectedFriend, selectedFriend, contactList, setContactList, hideChatForMobile, setHideChatForMobile}}>
    
                <div id="container">
                    <ContactListComponent />
                    {showChat ? <ConversationComponent /> : <Welcome />}
                </div>
            </ChatContext.Provider>
        );
    }
   
}


export default Home;
export { ChatContext };
