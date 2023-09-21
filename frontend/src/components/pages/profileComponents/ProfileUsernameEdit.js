import "../../../css/Profile.css";
import { backendHost } from "../../..";
import { useState, useEffect } from "react";
import { updateToken } from "../../../jwt";
import { useNavigate } from "react-router-dom";

const ProfileUsernameEdit = ({ userInfo, setUserInfo }) => {
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userInfo.UserName);
  const [originalUsername] = useState(userInfo.UserName);
  const [refreshProfile, setRefreshProfile] = useState(false);
  const navigate = useNavigate();

  // event listener for updates (new notification or new follower request)
  useEffect(() => {
    // event listener to existing ws connection
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "reload_profile_page") {
        console.log("REFRESHING PROFILE");
        setRefreshProfile(true);
      }
      // update notifications
    };
  }, [refreshProfile]);

  useEffect(() => {
    if (refreshProfile) {
      setRefreshProfile(false);
    }
  }, [refreshProfile]);

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

  const handleUsernameCancelClick = () => {
    setNewUsername(originalUsername);
    setIsEditingUsername(false);
  };

  return (
    <>
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
                  <button onClick={handleUsernameCancelClick}>Cancel</button>
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
    </>
  );
};
export default ProfileUsernameEdit;
