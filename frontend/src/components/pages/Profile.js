import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { useState, useEffect } from "react";
import { tokenValidation } from "../../index.js";
import { useNavigate } from "react-router-dom";
import { loadUser } from "../../jwt";

const Profile = ({ results }) => {
    const userInfo = JSON.parse(localStorage.getItem("CurrentUser"));

    let firstName = userInfo.FirstName;
    let lastName = userInfo.LastName;
    // Step 2: Set up a state variable to hold the value

    console.log(firstName);

    return (
        <>
            <Navbar />
            <Sidebar />
            <div className="profile">
                <div className="profile-picture-container">
                    <img
                        src={profilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                </div>
                <div className="profile-info">
                    <p className="username">Username: {userInfo.UserName}</p>
                    <p className="firstname">Firstname: {userInfo.FirstName}</p>
                    <p className="lastname">Lastname: {userInfo.LastName}</p>
                    <p className="dateofbirth">Dateofbirth: {userInfo.DateOfBirth}</p>
                    <p className="email">Email: {userInfo.Email}</p>
                </div>
            </div>
            <FriendsList />
        </>
    );
};

export default Profile;
