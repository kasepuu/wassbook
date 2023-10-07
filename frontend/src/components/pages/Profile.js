import "../../css/Profile.css";
import { useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect } from "react";
import PostsByProfile from "../PostsByProfile";
import { updateToken } from "../../jwt";
import ProfilePictureEdit from "./profileComponents/ProfilePictureEdit";
import ProfileUsernameEdit from "./profileComponents/ProfileUsernameEdit";
import ProfileDescriptionEdit from "./profileComponents/ProfileDescriptionEdit";
import ProfileFollow from "./profileComponents/ProfileFollow";

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
  const isPublicProfile =
    userInfo.PrivateStatus === 0 ||
    userInfo.FollowStatus === "following" ||
    userInfo.UserID === LoggedUser.UserID;
  const [profilePicUrl, setProfilePicUrl] = useState(
    `${backendHost}/users/${userInfo.UserID}/profilepic/profilepic`
  );
  const [refreshProfile, setRefreshProfile] = useState(false);

  // event listener for updates (new notification or new follower request)
  useEffect(() => {
    // event listener to existing ws connection
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "reload_profile_page") {
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
  }, [id, LoggedUser.UserName, refreshProfile]);

  useEffect(() => {
    if (userInfo !== undefined) {
      setProfilePicUrl(
        `${backendHost}/users/${userInfo.UserID}/profilepic/profilepic`
      );
    }
  }, [userInfo, refreshProfile]);

  return (
    <>
      <div className="profile-container">
        <div className="profile-info-container">
          <ProfilePictureEdit
            profilePicUrl={profilePicUrl}
            setProfilePicUrl={setProfilePicUrl}
            userInfo={userInfo}
          />
          <div className="profile-info">
            <ProfileUsernameEdit
              userInfo={userInfo}
              setUserInfo={setUserInfo}
            />

            <p className="firstname">
              Firstname: {toTitleCase(userInfo.FirstName)}
            </p>
            <p className="lastname">
              Lastname: {toTitleCase(userInfo.LastName)}
            </p>
            {userInfo.PrivateStatus === 0 ||
            userInfo.FollowStatus === "following" ||
            userInfo.UserID === LoggedUser.UserID ? (
              <>
                <p className="dateofbirth">
                  Dateofbirth: {userInfo.DateOfBirth}
                </p>
                <p className="email">Email: {userInfo.Email}</p>
                <p className="dateJoined">Date joined: {userInfo.DateJoined}</p>
              </>
            ) : (
              <>This profile is private!</>
            )}

            <ProfileDescriptionEdit
              userInfo={userInfo}
              setUserInfo={setUserInfo}
            />
            <ProfileFollow userInfo={userInfo} isLocalUser={isLocalUser} />
          </div>

          <div className="profile-privacy">
            {userInfo.UserID === LoggedUser.UserID ? (
              <>
                <button
                  className="Profile-Edit-Public"
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
                    <>Make profile Public</>
                  ) : (
                    <>Make profile Private</>
                  )}
                </button>
              </>
            ) : null}
          </div>
        </div>
        <>
          {isPublicProfile ? (
            <>
              <p>
                {userInfo.PrivateStatus === 0 &&
                userInfo.FollowStatus !== "following" &&
                userInfo.UserID !== LoggedUser.UserID
                  ? "Public"
                  : "All"}{" "}
                posts by {userInfo.FirstName}:
              </p>

              {userInfo.PrivateStatus === 0 &&
                userInfo.FollowStatus !== "following" &&
                userInfo.UserID !== LoggedUser.UserID && (
                  <div className="profile-posts">
                    <PostsByProfile
                      profilepic={`${profilePicUrl}?timestamp=${Date.now()}`}
                      userID={userInfo.UserID}
                      loggedUserID={LoggedUser.UserID}
                    />
                  </div>
                )}
              {userInfo.FollowStatus === "following" && (
                <div className="profile-posts">
                  <PostsByProfile
                    profilepic={`${profilePicUrl}?timestamp=${Date.now()}`}
                    userID={userInfo.UserID}
                    loggedUserID={LoggedUser.UserID}
                  />
                </div>
              )}
            </>
          ) : (
            <p>Public posts by {userInfo.FirstName}:</p>
          )}
        </>
      </div>
    </>
  );
};
export default Profile;
