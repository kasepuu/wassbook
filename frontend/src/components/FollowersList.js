import React, { useState, useEffect, useRef } from "react";
import { backendHost } from "../";
import "../css/Chat.css";
import Chat from "./Chat";
const FollowersList = () => {
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState(null);

  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  const openMessenger = (follower) => {
    closeMessenger(); // just in case
    localStorage.setItem("CurrentChat", JSON.stringify(follower));

    setIsMessengerOpen(true);
    setSelectedFollower(follower);
  };

  const closeMessenger = () => {
    localStorage.removeItem("CurrentChat");
    setIsMessengerOpen(false);
    setSelectedFollower(null);
  };

  useEffect(() => {
    // checking if theres chat information in local storage
    const chatInfo = JSON.parse(localStorage.getItem("CurrentChat"));

    if (chatInfo && chatInfo.UserID && chatInfo.UserName) {
      setSelectedFollower(chatInfo);
      setIsMessengerOpen(true);
    }

    fetch(`${backendHost}/getMutualFollowers`, {
      method: "POST",
      body: JSON.stringify({
        UserID: LoggedUser.UserID,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMutualFollowers(data);
      })
      .catch((error) => {
        console.error("Error fetching mutual followers:", error);
      });
  }, []);

  return (
    <div className="FollowersList">
      <h1>Followers:</h1>
      <ul>
        {mutualFollowers !== null &&
          mutualFollowers.length > 0 &&
          mutualFollowers.map((follower, index) => (
            <li
              key={`${follower.UserId}-${index}`}
              onClick={() => {
                openMessenger(follower);
              }}
            >
              {follower.UserName}
            </li>
          ))}
      </ul>

      {isMessengerOpen && selectedFollower && (
        <Chat
          selectedFollower={selectedFollower}
          closeMessenger={closeMessenger}
        />
      )}
    </div>
  );
};

export default FollowersList;
