import Sidebar from "../Sidebar";
import FriendsList from "../FollowersList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { json, useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect } from "react";
import PostsByProfile from "../PostsByProfile";
import { sendEvent } from "../../websocket.js";
import { useAuthorization } from "../Authorization";
import { useNavigate } from "react-router-dom";
import { updateToken } from "../../jwt";

// const refreshToken = async () => {
//   const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
//   const currentAccessToken = userInfo.accessToken;

//   try {
//     const response = await fetch(`${backendHost}/refresh-token`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${currentAccessToken}`, // Include the refresh token
//       },
//     });

//     if (response.ok) {
//       const newAccessToken = await response.json();
//       // Update the old access token with the new one
//       const userInfo = JSON.parse(sessionStorage.getItem("CurrentUser"));
//       userInfo.accessToken = newAccessToken.accessToken;
//       sessionStorage.setItem("CurrentUser", JSON.stringify(userInfo));
//     } else {
//       console.log("Token refresh failed.");
//     }
//   } catch (error) {
//     console.error("Error refreshing token:", error);
//   }
// };

//import { ButtonOr } from "semantic-ui-react";
function toTitleCase(str) {
  if (str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}

function handleFollowClick(receiverId, currentUserId, status) {
  const followResponse = {
    UserID: currentUserId.toString(),
    ReceivingUserID: receiverId.toString(),
    Status: status,
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
    .then((response) => {
      response.json();
      updateToken();
    })
    .catch((error) => {
      console.error("Error updating private status:", error);
    });
};

const handleDescriptionUpdate = (userID, newDescription) => {
  return fetch(`${backendHost}/update-user-description`, {
    method: "POST",
    body: JSON.stringify({
      userID: userID,
      newDescription: newDescription,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      updateToken();
      return response.json();
    })
    .then((data) => {
      console.log("User description updated successfully:", data.message);
    })
    .catch((error) => {
      console.error("Error updating user description:", error);
      throw error;
    });
};

const handleUsernameUpdate = (userID, newUsername) => {
  const navigate = useNavigate;
  return fetch(`${backendHost}/update-user-name`, {
    method: "POST",
    body: JSON.stringify({
      userID: userID,
      newUsername: newUsername,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      updateToken();
      return response.json();
    })
    .then((data) => {
      console.log("Username updated successfully:", data.message);
    })
    .catch((error) => {
      console.error("Error updating username:", error);
      throw error;
    });
};

const Profile = () => {
  const isAuthorized = useAuthorization();
  console.log("isAuthorized:", isAuthorized);

  let { id } = useParams();
  let isLocalUser = false;
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
  if (id === undefined || !id) id = LoggedUser.UserName;
  if (id === LoggedUser.UserName) isLocalUser = true;
  const [userInfo, setUserInfo] = useState({});

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState(userInfo.Description);
  const [originalDescription] = useState(userInfo.Description);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userInfo.UserName);
  const [originalUsername] = useState(userInfo.UserName);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setIsEditingDescription(true);
  };

  const handleSaveClick = () => {
    handleDescriptionUpdate(userInfo.UserID, newDescription)
      .then(() => {
        console.log("User description updated successfully");
        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          Description: newDescription,
        }));
        setIsEditingDescription(false);
      })
      .catch((error) => {
        console.error("Error updating user description:", error);
      });
    setIsEditingDescription(false);
  };

  const handleCancelClick = () => {
    setNewDescription(originalDescription);
    setIsEditingDescription(false);
  };

  const handleUsernameEditClick = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameSaveClick = () => {
    handleUsernameUpdate(userInfo.UserID, newUsername)
      .then(() => {
        console.log("Username updated successfully");
        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          UserName: newUsername,
        }));
        setIsEditingUsername(false);
      })
      .catch((error) => {
        console.error("Error updating username:", error);
      });
    setIsEditingUsername(false);
    // refreshToken();
  };

  const handleUsernameCancelClick = () => {
    setNewUsername(originalUsername);
    setIsEditingUsername(false);
  };

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
            {userInfo.UserID === LoggedUser.UserID ? (
              <>
                <div>
                  Username:
                  {isEditingUsername ? (
                    <div>
                      <input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                      <div>
                        <button onClick={handleUsernameSaveClick}>Save</button>
                        <button onClick={handleUsernameCancelClick}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>{userInfo.UserName}</p>
                      <button onClick={handleUsernameEditClick}>Edit</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Display username for other users
              <div>Username: {userInfo.UserName}</div>
            )}

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
              </>
            ) : (
              <>This profile is private!</>
            )}

            {userInfo.UserID === LoggedUser.UserID ? (
              <>
                <div>
                  Description:
                  {isEditingDescription ? (
                    <div>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                      />
                      <div>
                        <button onClick={handleSaveClick}>Save</button>
                        <button onClick={handleCancelClick}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>{userInfo.Description}</p>
                      <button onClick={handleEditClick}>Edit</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="description">
                  Description: {userInfo.Description}
                </p>
              </>
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
                        let status = "following";
                        if (userInfo.PrivateStatus === 1) status = "pending";
                        handleFollowClick(
                          userInfo.UserID,
                          LoggedUser.UserID,
                          status
                        );
                        setUserInfo((prevUserInfo) => ({
                          ...prevUserInfo,
                          FollowStatus: "pending",
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
            <p>Posts by {userInfo.FirstName}:</p>

            <div className="profile-posts">
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
