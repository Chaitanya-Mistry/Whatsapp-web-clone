import { useContext } from "react";
import { AppContext } from "../App";

export const EditProfilePic = () => {
    const { loggedInUserData } = useContext(AppContext);
    return (
        <div id="editProfileContainer">
            <img src={loggedInUserData.profilePic} alt={loggedInUserData.name + `'s profile pic`} />

            <form id="changeProfilePicForm">
                <label htmlFor="myfile">Select a profile pic:</label>
                <input type="file" id="myfile" name="myfile" accept="image/*" required />
                <button>Update Profile</button>
            </form>
        </div>
    )
}