import Sidebar from "../Sidebar";
import FriendsList from "../FriendsList";
import Navbar from "../Navbar";
import "../../css/Profile.css";
import profilePicture from "../../page-images/blank.png";
import { useParams } from "react-router-dom";
import { backendHost } from "../..";
import { useState, useEffect } from "react";
import PostsByProfile from "../PostsByProfile";
//import { ButtonOr } from "semantic-ui-react";

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
        {console.log(userInfo)}
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
            {userInfo.Friends || isLocalUser ? (
              <>
                <p>You are friends with this user</p>
                <p className="dateofbirth">
                  Dateofbirth: {userInfo.DateOfBirth}
                </p>
                <p className="email">Email: {userInfo.Email}</p>
              </>
            ) : (
              <div className="not-friends-message">
                You are not friends with this user.
                <button>Add Friend &gt;.&lt;</button>
                {/* TODO: Sellega buttoniga läbi websocketi (kui selline meil üldse töökorras 💀) request saata ja lisada followeri databaasi staatus: pending.
                    Võib notification asju ka vaikselt vaadata ;) */}
              </div>
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
