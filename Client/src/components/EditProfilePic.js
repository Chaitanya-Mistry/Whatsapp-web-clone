import axios from "axios";
import { useContext, useState } from "react";
import { AppContext } from "../App";
import { ChatContext } from "./Home";

export const EditProfilePic = () => {
    const { loggedInUserData } = useContext(AppContext);
    const { setEditProfile, setUserProfilePic, userProfilePic } = useContext(ChatContext);
    const [selectedImage, setSelectedImage] = useState("");

    const uploadImageHandler = async (event) => {
        event.preventDefault();

        if (selectedImage) {
            const baseUrl = `http://localhost:4000/updateProfilePic`;

            let response;
            try {
                const formData = new FormData();
                formData.append('myProfilePic', selectedImage);
                response = await axios({
                    url: baseUrl,
                    method: "PATCH",
                    data: formData,
                    withCredentials: true
                });
            } catch (err) {
                alert("Error: ", err);
            }

            if (response.data.serverResponse.responseCode === 200) {
                alert(`${response.data.serverResponse.message}`);
                setUserProfilePic(response.data.serverResponse.responseData.profilePic); // Store updated profile pic reference
                setEditProfile(false); // To hide edit profile pic container                
            } else {
                alert(`🟥 ERROR 🟥: ${response.data.serverResponse.message}`);
            }
        } else {
            alert("Please select an image 😶");
        }
    }
    const imageSelected = (event) => {
        setSelectedImage(event.target.files[0]);  // Get and store selected image        
    }
    return (
        <div id="editProfileContainer">
            <div id="profilePicContainer">
                {/* Profile Pic 🔴*/}
                {userProfilePic.includes("cdn") ? <img src={loggedInUserData.profilePic} alt={loggedInUserData.name + `'s profile pic`} /> : <img src={"http://localhost:4000/Profile_Pics/" + userProfilePic} alt={loggedInUserData.name + `'s profile pic`} />}

            </div>

            <form id="changeProfilePicForm" onSubmit={uploadImageHandler} encType="multipart/form-data">
                <label htmlFor="myProfilePic">Select a profile pic:</label>
                <input type="file" id="myProfilePic" name="myProfilePic" accept="image/*" required onChange={imageSelected} />
                <button>Update Profile</button>
                <p id="goBack" onClick={() => setEditProfile(false)}>Cancel</p>
            </form>
        </div>
    )
}