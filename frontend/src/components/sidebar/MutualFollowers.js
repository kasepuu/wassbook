import React, { useState, useEffect, useRef } from "react";
import "../../css/Chat.css";
import Messenger from "./Messenger";
import { backendHost } from "../..";
import { sendEvent } from "../../websocket";
const MutualFollowers = () => {
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState(null);

  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  useEffect(() => {
    const handleWebSocketMessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_followerslist") {
        console.log("EVENT RECEIVED in MutualFollowers: update_followerslist");
        setMutualFollowers(eventData.payload);
      }
    };

    window.socket.addEventListener("message", handleWebSocketMessage);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      window.socket.removeEventListener("message", handleWebSocketMessage);
    };
  }, []);

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

  const chatInfo = JSON.parse(localStorage.getItem("CurrentChat"));

  if (chatInfo && chatInfo.UserID && chatInfo.UserName) {
    setSelectedFollower(chatInfo);
    setIsMessengerOpen(true);
  }

  return (
    <div className={`FollowerContainer`}>
      <div className="GroupsList">
        <p>Groups:</p>
      </div>

      <div className="FollowersList">
        <p>Followers:</p>

        {mutualFollowers !== null && mutualFollowers.length > 0 ? (
          mutualFollowers.map((follower, index) => (
            <li
              key={follower.UserId}
              onClick={() => {
                openMessenger(follower);
              }}
            >
              {follower.UserName}
            </li>
          ))
        ) : (
          <p>No mutual followers found.</p>
        )}
      </div>

      {isMessengerOpen && selectedFollower && (
        <Messenger
          selectedFollower={selectedFollower}
          closeMessenger={closeMessenger}
        />
      )}
    </div>
  );
};

export default MutualFollowers;
