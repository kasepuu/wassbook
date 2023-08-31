import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect } from "react";
import PostsByProfile from "../PostsByProfile";
import { sendEvent } from "../../websocket.js";
import { useAuthorization } from "../Authorization";
//import { ButtonOr } from "semantic-ui-react";
function toTitleCase(str) {
  if (str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}
function handleFollowClick(recieverId, currentUserId) {
  const followResponse = {
    UserID: currentUserId.toString(),
    ReceivingUserID: recieverId.toString(),
  };
  sendEvent("follow_user", followResponse);
}
const handleToggleClick = (userID, PrivateStatus) => {
  const newPrivateValue = PrivateStatus === 1 ? 0 : 1;
  fetch(`${backendHost}/update-private-status`, {
    method: "POST",
    body: JSON.stringify({
      userID: userID,
      newPrivateValue: newPrivateValue,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error updating private status:", error);
    });
};

const Profile = () => {
  const isAuthorized = useAuthorization();
  console.log("isAuthorized:", isAuthorized);

  let { id } = useParams();
  let isLocalUser = false;
  const LoggedUser = JSON.parse(localStorage.getItem("CurrentUser"));
  if (id === undefined || !id) id = LoggedUser.UserName;
  if (id === LoggedUser.UserName) isLocalUser = true;
  const [userInfo, setUserInfo] = useState({});
  useEffect(() => {
    function fetchProfileData() {
      fetch(
        `${backendHost}/fetch-current-profile?ProfileName=${id}&RequestedBy=${LoggedUser.UserName}`
      )
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 202) {
            console.log("user does not exist! :'(");
            return null;
          }
        })
        .then((data) => {
          if (data != null) {
            setUserInfo(data);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
    fetchProfileData();
  }, [id, LoggedUser.UserName]);
  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="profile-container">
        <div className="profile-info-container">
          <img src={profilePicture} alt="Profile" className="profilepic" />
          <div className="profile-info">
            <p className="username">Username: {userInfo.UserName}</p>
            <p className="firstname">
              Firstname: {toTitleCase(userInfo.FirstName)}
            </p>
            <p className="lastname">
              Lastname: {toTitleCase(userInfo.LastName)}
            </p>
            {userInfo.PrivateStatus === 0 ||
            userInfo.UserID === LoggedUser.UserID ? (
              <>
                <p className="dateofbirth">
                  Dateofbirth: {userInfo.DateOfBirth[0]}.
                  {userInfo.DateOfBirth[1]}.{userInfo.DateOfBirth[2]}
                </p>
                <p className="email">Email: {userInfo.Email}</p>
                <p className="dateJoined">Date joined: {userInfo.DateJoined}</p>
                <p className="description">
                  Description: {userInfo.Description}
                </p>
              </>
            ) : (
              <>This profile is private!</>
            )}
            {userInfo.FollowStatus === "following" || isLocalUser ? (
              <p>You are following this user</p>
            ) : (
              <div>
                {userInfo.FollowStatus === "pending" ? (
                  <div className="not-friends-message">
                    You are not following this user yet.
                    <button disabled>Request pending ⏳</button>
                  </div>
                ) : (
                  <p>
                    You are not following this user.
                    <button
                      onClick={() => {
                        handleFollowClick(userInfo.UserID, LoggedUser.UserID);
                        setUserInfo((prevUserInfo) => ({
                          ...prevUserInfo,
                          FollowStatus: "following",
                        }));
                      }}
                      value={userInfo.UserID}
                    >
                      Follow &gt;.&lt;
                    </button>
                  </p>
                )}
              </div>
            )}
            {userInfo.UserID === LoggedUser.UserID ? (
              <>
                <button
                  onClick={() => {
                    console.log(userInfo.PrivateStatus);
                    handleToggleClick(userInfo.UserID, userInfo.PrivateStatus);
                    setUserInfo((prevUserInfo) => ({
                      ...prevUserInfo,
                      PrivateStatus: userInfo.PrivateStatus === 1 ? 0 : 1,
                    }));
                  }}
                  value={userInfo.UserID}
                >
                  {userInfo.PrivateStatus === 1 ? (
                    <>Make Public</>
                  ) : (
                    <>Make Private</>
                  )}
                </button>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        {userInfo.PrivateStatus === 0 ||
        userInfo.UserID === LoggedUser.UserID ? (
          <>
            {" "}
            <div className="profile-posts">
              <p>Posts by {userInfo.UserName}:</p>
              {userInfo.FollowStatus === "following" || isLocalUser ? (
                <>
                  <PostsByProfile />
                </>
              ) : (
                <>
                  He must follow you back before you can see their private posts
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1>This profile is private!</h1>
          </>
        )}
      </div>
      <FriendsList />
    </>
  );
};
export default Profile;
