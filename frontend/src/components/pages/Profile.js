import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect } from "react";

const Profile = () => {
  let { id } = useParams();
  const LoggedUser = JSON.parse(localStorage.getItem("CurrentUser"));
  if (id === undefined || !id) id = LoggedUser.UserName;
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const response = await fetch(
          `${backendHost}/fetch-current-profile?ProfileName=${id}&RequestedBy=${LoggedUser.UserName}`
        );

        if (response.status === 200) {
          const data = await response.json();
          setUserInfo(data);
        } else if (response.status === 202) {
          console.log("user does not exist! :'(");
          // handle "does not exist" äkki näidata logged useri infot?
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchProfileData();
  }, [id]);

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="profile">
        <div className="profile-picture-container">
          <img src={profilePicture} alt="Profile" className="profilepic" />
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
