import React, { useState, useEffect } from "react";
import "../../css/Chat.css";
import Messenger from "./Messenger";
import GroupMessenger from "./GroupMsg";

const MutualFollowers = () => {
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState(null);

  const [groups, setGroups] = useState([])
  const [isGroupMessengerOpen, setIsGroupMessengerOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

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
    const chatInfo = JSON.parse(localStorage.getItem("CurrentChat"));

    if (chatInfo && chatInfo.UserID && chatInfo.Name) {
      setSelectedChat(chatInfo);
      setIsGroupMessengerOpen(true);
    }
  }, [setSelectedChat, setIsGroupMessengerOpen]);

  const openGroupMessenger = (group) => {
    closeGroupMessenger(); 
    closeMessenger();
    localStorage.setItem("CurrentChat", JSON.stringify(group));

    setIsGroupMessengerOpen(true);
    setSelectedChat(group);
  };

  const closeGroupMessenger = () => {
    localStorage.removeItem("CurrentChat");
    setIsGroupMessengerOpen(false);
    setSelectedChat(null);
  };
  const chatInfo = JSON.parse(localStorage.getItem("CurrentChat"));
  if (chatInfo && chatInfo.UserID && chatInfo.UserName) {
    setSelectedChat(chatInfo);
    setIsGroupMessengerOpen(true);
  }


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
    closeGroupMessenger()
    localStorage.setItem("CurrentChat", JSON.stringify(follower));

    setIsMessengerOpen(true);
    setSelectedFollower(follower);
  };

  const closeMessenger = () => {
    localStorage.removeItem("CurrentChat");
    setIsMessengerOpen(false);
    setSelectedFollower(null);
  };

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
                openGroupMessenger(group);
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

      {isGroupMessengerOpen && selectedChat && (
        <GroupMessenger
          selectedChat={selectedChat}
          closeGroupMessenger={closeGroupMessenger}
        />
      )}

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
