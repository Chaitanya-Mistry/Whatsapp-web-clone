import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../App";
import { useContext } from "react";
import io from "socket.io-client";

export const Login = () => {

    const navigate = useNavigate();
    const userCredentialsFromSignUp = useLocation(); // To get user's credentials from signUp component 😎
    const { setLogIn, setLoggedInUserData, setSocketConnection } = useContext(AppContext);

    // Store user's credentials from signUp component
    let userCredentials = null;
    if (userCredentialsFromSignUp.state) {
        userCredentials = userCredentialsFromSignUp.state;
    }
    // Navigate to sign up component.
    const navigateToSignUp = (event) => {
        event.preventDefault();
        navigate("/signUp");
    }

    // Login Handler
    const handleLogin = async (event) => {
        event.preventDefault();
        // Store user credentials in an object ..
        const userLoginCredentials = {
            userEmail: event.target["userEmail"].value,
            userPassword: event.target["userPassword"].value
        }

        // Sending POST request to our API server .. ⬆️
        const baseURL = 'http://localhost:4000/login';

        let response;
        try {
            response = await axios.post(baseURL, {
                email: userLoginCredentials.userEmail,
                password: userLoginCredentials.userPassword
            }, { withCredentials: true }); // To receive JWT in cookie from our API server ... 🍪
        } catch (err) {
            response = err.response;
        }

        if (response.data.serverResponse.responseCode === 200) {
            const socketServerEndPoint = "http://localhost:4000"; // Socket.IO Server Endpoint
            const socket = io(socketServerEndPoint);
            socket.emit('register', response.data.serverResponse.responseData.email);
            setSocketConnection(socket);
            
            alert(`${response.data.serverResponse.message}`);
            setLogIn(true);
            setLoggedInUserData(response.data.serverResponse.responseData);

            navigate("/", { state: response.data.serverResponse.responseData }); // Navigate to the main home page ..  🏡
        } else {
            alert(`🟥 ERROR 🟥: ${response.data.serverResponse.message}`);
        }
    }

    return (
        <main>
            <div id="loginContainer">
                {/* For login illustration */}
                <div id="loginImage">
                    {/* https://www.freepik.com/free-vector/access-control-system-abstract-concept_12085707.htm#query=login&position=0&from_view=keyword */}
                    {/* Image provided by www.freepik.com */}
                    <img src="https://img.freepik.com/free-vector/access-control-system-abstract-concept_335657-3180.jpg?w=740&t=st=1662589406~exp=1662590006~hmac=4bc3af49bb257fc5b5a4543e663bd66c92286af862a8e4527ae233e0efd4fff9" />
                </div>
                {/* To enter login details */}
                <div id="loginDetails">
                    <h2 id="loginTitle">Sign In</h2>
                    <form onSubmit={handleLogin} id="loginForm">

                        <input type="email" name="userEmail" id="userEmail" defaultValue={userCredentials ? userCredentials.userEmail : ""} placeholder="📧 Your Email" required />
                        <input type="password" name="userPassword" id="userPassword" defaultValue={userCredentials ? userCredentials.userPassword : ""} placeholder="🔒 Password" required />
                        <button>Log in</button>

                        <strong style={{ fontSize: "21px", textAlign: "center" }}>or</strong>
                        <button id="signUpBtn" onClick={navigateToSignUp}>Sign Up</button>
                    </form>
                </div>
            </div>
        </main>
    )
}