import React, { useState, useEffect, useRef } from "react";
import { backendHost } from "../";
import "../css/Chat.css";
const FollowersList = (UserID) => {
  const [mutualFollowers, setMutualFollowers] = useState([]);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState(null);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const LoggedUser = JSON.parse(sessionStorage.getItem("CurrentUser"));

  const openMessenger = (follower) => {
    localStorage.setItem("CurrentChat", JSON.stringify(follower));

    setIsMessengerOpen(true);
    setSelectedFollower(follower);
  };

  const closeMessenger = () => {
    localStorage.removeItem("CurrentChat");
    setIsMessengerOpen(false);
    setSelectedFollower(null);
  };

  const sendMessage = () => {
    console.log("Message:  [", message, "] has been sent!");
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
        <div className="Messenger">
          <div className="chat-title">📪{selectedFollower.UserName}</div>
          {/* dummy data for now ;) */}
          <div className="chat-log">
            <div className="chat-log-from">
              <div className="chat-log-from-message">
                <div className="chat-log-from-image"></div>
                Hello there! How are you?
              </div>
              <div className="chat-log-from-date">Sent on: 2023-09-15</div>
            </div>
            <div className="chat-log-to">
              <div className="chat-log-content">
                <div className="chat-log-to-image"></div>
                <div className="chat-log-to-message">
                  Hi! I'm doing great, thanks for asking.eat, thanks for
                  asking.eat, thanks for asking.eat, thanks for asking.eat,
                  thanks for asking.eat, thanks for asking.eat, thanks for
                  asking.eat, thanks for asking.
                </div>
              </div>
              <div className="chat-log-to-date">Received on: 2023-09-16</div>
            </div>

            <div className="chat-log-from">
              <div className="chat-log-from-message">
                <div className="chat-log-from-image"></div>
                Hello there! How are you?
              </div>
              <div className="chat-log-from-date">Sent on: 2023-09-15</div>
            </div>
            <div className="chat-log-to">
              <div className="chat-log-content">
                <div className="chat-log-to-image"></div>
                <div className="chat-log-to-message">
                  Hi! I'm doing great, thanks for asking.eat, thanks for
                  asking.eat, thanks for asking.eat, thanks for asking.eat,
                  thanks for asking.eat, thanks for asking.eat, thanks for
                  asking.eat, thanks for asking.
                </div>
              </div>
              <div className="chat-log-to-date">Received on: 2023-09-16</div>
            </div>
          </div>
          <div className="chat-status"></div> {/*status -> is typing etc...*/}
          <div className="chat-close" onClick={closeMessenger}>
            X
          </div>
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-send"
              placeholder="Type your message..."
              value={message} // Bind the input value to the message state
              onChange={(e) => setMessage(e.target.value)} // Update the message state when input changes
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevent the default newline behavior
                  sendMessage(); // Call the sendMessage function when Enter is pressed
                }
              }}
              ref={inputRef} // Assign the ref to the input element
            />
            <button className="send-button" onClick={sendMessage}>
              Send
            </button>
          </div>
          {/* Add your messenger content here */}
        </div>
      )}
    </div>
  );
};

export default FollowersList;
