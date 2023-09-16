import { useEffect, useRef, useState } from "react";
import { sendEvent } from "../websocket";

const Chat = ({ selectedFollower, closeMessenger }) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const chatLogRef = useRef(null);
  const [chatLog, setChatLog] = useState([]);

  // get current chat
  useEffect(() => {
    const sender = JSON.parse(sessionStorage.getItem("CurrentUser")).UserID;
    const receiver = selectedFollower.UserId;

    const payload = {
      SenderID: sender,
      ReceiverID: receiver,
    };

    sendEvent("request_messages", payload);
  }, [selectedFollower]);

  // event listener for chat updates
  useEffect(() => {
    // event listener to existing ws connection
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "update_messages") {
        // update the chat log with the received message, only if chat is opened with the right person.
        if (eventData.payload) {
          if (
            JSON.parse(localStorage.getItem("CurrentChat")).UserId ===
            eventData.payload.CurrentChat
          ) {
            setChatLog(eventData.payload.ChatLog);
          }
        }
      } else {
        // update notifications
      }
    };
  }, [selectedFollower]);

  // scroll to the bottom on chatLog change
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatLog]);

  const sendMessage = (sender, receiver) => {
    const payload = {
      Message: message,
      SenderID: sender,
      ReceiverID: receiver,
    };
    setMessage("");
    sendEvent("send_message", payload);
  };

  return (
    <div className="Messenger">
      <div className="chat-title">📪{selectedFollower.UserName}</div>
      {/* chat-log */}
      <div className="chat-log" ref={chatLogRef}>
        {chatLog.length === 0 ? (
          <div className="empty-chat-message">
            You are now connected on Wassbook.
          </div>
        ) : (
          chatLog.map((message, index) => (
            <div
              key={index}
              className={`chat-log-${
                message.UserName === selectedFollower.UserName ? "to" : "from"
              }`}
            >
              <div className="chat-log-content">
                <div className="chat-log-to-image">{message.UserName}</div>
                <div className="chat-log-to-message">{message.Message}</div>
              </div>
              <div className="chat-log-to-date">
                {message.UserName === selectedFollower.UserName
                  ? `Received on: ${message.Date}`
                  : `Sent on: ${message.Date}`}
              </div>
            </div>
          ))
        )}
      </div>
      {/*other chat elements*/}
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

              sendMessage(
                JSON.parse(sessionStorage.getItem("CurrentUser")).UserID,
                selectedFollower.UserId
              ); // Call the sendMessage function when Enter is pressed
            }
          }}
          ref={inputRef} // Assign the ref to the input element
        />
        <button
          className="send-button"
          onClick={() => {
            sendMessage(
              JSON.parse(sessionStorage.getItem("CurrentUser")).UserID,
              selectedFollower.UserId
            );
          }}
        >
          Send
        </button>
      </div>
      {/* Add your messenger content here */}
    </div>
  );
};

export default Chat;
