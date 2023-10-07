import "../../../css/Profile.css";
import { backendHost } from "../../..";
import { useState, useEffect } from "react";
import { updateToken } from "../../../jwt";

const ProfileDescriptionEdit = ({ userInfo, setUserInfo }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState(userInfo.Description);
  const [originalDescription, setOriginalDescription] = useState(
    userInfo.Description
  );
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  useEffect(() => {
    if (userInfo.Description) {
      setOriginalDescription(userInfo.Description);
      setNewDescription(userInfo.Description);
    }
  }, [userInfo.Description]);

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

  return (
    <>
      {userInfo.UserID === LoggedUser.UserID ? (
        <>
          <div className="Profile-Description-Container">
            Description:
            {isEditingDescription ? (
              <div>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <div>
                  <button
                    className="Profile-Description-Edit-Save"
                    onClick={handleSaveClick}
                  >
                    Save
                  </button>
                  <button
                    className="Profile-Description-Edit-Cancel"
                    onClick={handleCancelClick}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p>{userInfo.Description}</p>
                <button
                  className="Profile-Description-Edit"
                  onClick={handleEditClick}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="description">Description: {userInfo.Description}</p>
        </>
      )}
    </>
  );
};
export default ProfileDescriptionEdit;
