import React, { useState, useEffect } from "react";
import "../../css/Chat.css";
import Messenger from "./Messenger";
const MutualFollowers = () => {
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState(null);
  const [groups, setGroups] = useState([])

  useEffect(() => {
    const handleWebSocketMessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_followerslist") {
        console.log("EVENT RECEIVED in MutualFollowers: update_followerslist", eventData.payload);
        setMutualFollowers(eventData.payload);
      }
      if (eventData.type === "update_groupslist") {
        console.log("EVENT RECEIVED in MutualFollowers: update_groupslist", eventData.payload);
        setGroups(eventData.payload)
      }
    };

    if (window.socket) {
      window.socket.addEventListener("message", handleWebSocketMessage);
    }

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      if (window.socket) {
        window.socket.addEventListener("message", handleWebSocketMessage);
      }
    };
  }, []);

  useEffect(() => {
    // checking if theres currentchat information stored in localstorage
    const chatInfo = JSON.parse(localStorage.getItem("CurrentChat"));

    if (chatInfo && chatInfo.UserID && chatInfo.UserName) {
      setSelectedFollower(chatInfo);
      setIsMessengerOpen(true);
    }
  }, [setSelectedFollower, setIsMessengerOpen]);

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

        {groups !== null && groups.length > 0 ? (
          groups.map((group) => (
            <li
              key={group.GroupID}
              onClick={() => {
                openMessenger(group.GroupName);
              }}
            >
              {group.GroupName}
            </li>
          ))
        ) : (
          <p>You haven't joined any groups yet.</p>
        )}
      </div>

      <div className="FollowersList">
        <p>You can chat with people you follow and who follow you:</p>

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
