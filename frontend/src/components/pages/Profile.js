import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect } from "react";
import PostsByProfile from "../PostsByProfile";
const Profile = () => {
  let { id } = useParams();
  let isLocalUser = false;
  const LoggedUser = JSON.parse(localStorage.getItem("CurrentUser"));
  if (id === undefined || !id) id = LoggedUser.UserName;
  if (id === LoggedUser.UserName) isLocalUser = true;
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
  }, [id, LoggedUser.UserName]);

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="profile-container">
        {console.log(userInfo)}
        <div className="profile-info-container">
          <img src={profilePicture} alt="Profile" className="profilepic" />

          <div className="profile-info">
            <p className="username">Username: {userInfo.UserName}</p>
            <p className="firstname">Firstname: {userInfo.FirstName}</p>
            <p className="lastname">Lastname: {userInfo.LastName}</p>
            {userInfo.Friends || isLocalUser ? (
              <>
                <p>You are friends with this user</p>
                <p className="dateofbirth">
                  Dateofbirth: {userInfo.DateOfBirth}
                </p>
                <p className="email">Email: {userInfo.Email}</p>
              </>
            ) : (
              <p className="not-friends-message">
                You are not friends with this user.
              </p>
            )}
          </div>
        </div>

        <div className="profile-posts">
          <p>Posts by {userInfo.UserName}:</p>
          {userInfo.Friends || isLocalUser ? (
            <>
              <PostsByProfile />
            </>
          ) : (
            <>He must follow you back before you can see their private posts</>
          )}
        </div>
      </div>
      <FriendsList />
    </>
  );
};

export default Profile;
