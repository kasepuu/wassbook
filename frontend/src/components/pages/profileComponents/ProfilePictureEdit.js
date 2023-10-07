import "../../../css/Profile.css";
import profilePicture from "../../../page-images/blank.png";
import { useParams } from "react-router-dom";
import { backendHost } from "../../..";
import { useState, useEffect, useRef } from "react";
import { FaImage } from "react-icons/fa";

const ProfilePictureEdit = ({ profilePicUrl, setProfilePicUrl, userInfo }) => {
  let { id } = useParams();
  let isLocalUser = false;
  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));
  if (id === undefined || !id) id = LoggedUser.UserName;
  if (id === LoggedUser.UserName) isLocalUser = true;
  const [isEditingProfilepic, setIsEditingProfilepic] = useState(false);
  const profilepicFileInputRef = useRef(null);

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

  useEffect(() => {
    if (userInfo !== undefined) {
      setProfilePicUrl(
        `${backendHost}/users/${userInfo.UserID}/profilepic/profilepic`
      );
    }
  }, [userInfo, setProfilePicUrl]);

  return (
    <>
      {profilePicUrl !== null ? (
        <div className="ProfilePicture-Settings">
          <img
            src={`${profilePicUrl}?timestamp=${Date.now()}`}
            alt="profilepicture"
            className="profilepic"
            onError={(e) => {
              e.target.onError = null;
              e.target.src = profilePicture;
            }}
          />
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
                    className="ProfilePic-Select"
                    type="button"
                    onClick={() => profilepicFileInputRef.current.click()}
                  >
                    Select <FaImage />
                  </button>
                  <div>
                    <button
                      className="ProfilePic-Cancel"
                      onClick={handleProfilepicCancelClick}
                    >
                      Cancel
                    </button>
                    <button
                      className="ProfilePic-Save"
                      onClick={handleProfilepicSaveClick}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    className="ProfilePic-Cancel"
                    onClick={handleProfilepicEditClick}
                  >
                    Edit
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      ) : (
        <div>Loading profile picture...</div>
      )}
    </>
  );
};
export default ProfilePictureEdit;
