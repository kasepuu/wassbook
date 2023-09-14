import Sidebar from "../Sidebar";
import FriendsList from "../FollowersList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect, useRef } from "react";
import PostsByProfile from "../PostsByProfile";
import { updateToken } from "../../jwt";

function toTitleCase(str) {
  if (str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
}

const Profile = () => {
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
  const [isEditingProfilepic, setIsEditingProfilepic] = useState(false);
  const [newUsername, setNewUsername] = useState(userInfo.UserName);
  const [originalUsername] = useState(userInfo.UserName);
  const profilepicFileInputRef = useRef(null);
  const [profilePicUrl, setProfilePicUrl] = useState(
    `${backendHost}/users/${userInfo.UserID}/profilepic/profilepic`
  );

  function handleUnFollow(requesterID, targetID) {
    console.log("handleunfollow", requesterID, targetID);

    fetch(`${backendHost}/request-unfollow`, {
      method: "POST",
      body: JSON.stringify({
        UserID: requesterID,
        TargetID: targetID,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("response:", response);
        if (response.ok) {
          console.log("unfollowitud!");
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            FollowStatus: "",
          }));
        }
      })
      .catch((error) => {
        console.error("Error unfollowing:", error);
      });
  }

  function handleFollowClick(requesterID, targetID, status) {
    console.log("handlefollow", requesterID, targetID);

    fetch(`${backendHost}/request-follow`, {
      method: "POST",
      body: JSON.stringify({
        UserID: requesterID,
        TargetID: targetID,
        Status: status,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("response:", response);
        if (response.ok) {
          setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            FollowStatus: status,
          }));
        }
      })
      .catch((error) => {
        console.error("Error unfollowing:", error);
      });

    // sendEvent("follow_user", followResponse); // notification
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
      .catch((error) => {
        console.error("Error updating user description:", error);
        throw error;
      });
  };

  const handleUsernameUpdate = (userID, newUsername) => {
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
        updateToken(true);
        return response.json();
      })
      .catch((error) => {
        console.error("Error updating username:", error);
        throw error;
      });
  };

  const handleEditClick = () => {
    setIsEditingDescription(true);
  };

  const handleSaveClick = () => {
    handleDescriptionUpdate(userInfo.UserID, newDescription)
      .then(() => {
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
  };

  const handleProfilepicCancelClick = () => {
    setIsEditingProfilepic(false);
  };

  const handleProfilepicEditClick = () => {
    setIsEditingProfilepic(true);
  };

  const handleProfilepicSaveClick = (event) => {
    event.preventDefault();

    if (profilepicFileInputRef.current.files.length > 0) {
      const formData = new FormData();
      formData.append("file", profilepicFileInputRef.current.files[0]);
      fetch(
        `${backendHost}/update-profile-picture/?userid=${userInfo.UserID}`,
        {
          method: "POST",
          body: formData,
        }
      )
        .then((response) => {
          if (response.ok) {
            setIsEditingProfilepic(false);
            setProfilePicUrl(
              `${backendHost}/users/${
                userInfo.UserID
              }/profilepic/profilepic?timestamp=${Date.now()}`
            );
          }
        })
        .catch((error) => {
          console.error("Error saving profile picture:", error);
        });
    } else {
      console.error("No file selected.");
    }
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
  useEffect(() => {
    // Check if userInfo is available and not undefined
    if (userInfo !== undefined) {
      // Set the profilePicUrl when userInfo becomes available
      setProfilePicUrl(
        `${backendHost}/users/${userInfo.UserID}/profilepic/profilepic`
      );
    }
  }, [userInfo]); // Watch for changes in userInfo

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="profile-container">
        <div className="profile-info-container">
          {profilePicUrl !== null ? (
            <img
              src={`${profilePicUrl}?timestamp=${Date.now()}`}
              alt="profilepicture"
              className="profilepic"
              onError={(e) => {
                e.target.onError = null;
                e.target.src = profilePicture;
              }}
            />
          ) : (
            <div>Loading profile picture...</div>
          )}
          {isLocalUser ? (
            <>
              {isEditingProfilepic ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={profilepicFileInputRef}
                    className="hidden-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => profilepicFileInputRef.current.click()}
                  >
                    pilt
                  </button>
                  <div>
                    <button onClick={handleProfilepicSaveClick}>Save</button>
                    <button onClick={handleProfilepicCancelClick}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={handleProfilepicEditClick}>Edit</button>
                </div>
              )}
            </>
          ) : (
            <></>
          )}

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
              // Check if not a local user
              !isLocalUser ? (
                <button
                  onClick={() => {
                    handleUnFollow(LoggedUser.UserID, userInfo.UserID);
                  }}
                >
                  Unfollow
                </button>
              ) : null // Render null if local user
            ) : (
              <div>
                {userInfo.FollowStatus === "pending" ? (
                  <div className="not-friends-message">
                    You are not following this user yet.
                    <button disabled>Request pending ⏳</button>
                    <button
                      onClick={() => {
                        handleUnFollow(LoggedUser.UserID, userInfo.UserID);
                      }}
                    >
                      Cancel request
                    </button>
                  </div>
                ) : (
                  <p>
                    You are not following this user.
                    <button
                      onClick={() => {
                        let status = "following";
                        if (userInfo.PrivateStatus === 1) status = "pending";
                        handleFollowClick(
                          LoggedUser.UserID,
                          userInfo.UserID,
                          status
                        );
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
                  <PostsByProfile
                    profilepic={`${profilePicUrl}?timestamp=${Date.now()}`}
                  />
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
