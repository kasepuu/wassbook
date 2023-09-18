import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { sendEvent } from "../websocket";
// import EmojiPicker from "emoji-picker-react";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));

const Chat = ({ selectedFollower, closeMessenger }) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const chatLogRef = useRef(null);
  const [chatLog, setChatLog] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  console.log("FOLOWER SELECTED:", selectedFollower);
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
            if (eventData.payload.ChatLog) {
              setChatLog(eventData.payload.ChatLog);
            }
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

  const handleEmojiSelect = (emoji) => {
    setMessage((prevMsg) => prevMsg + emoji.emoji);
  };
  // Function to handle emoji selection

  return (
    <div className="Messenger">
      <div className="chat-title">📪{selectedFollower.UserName}</div>
      {/* chat-log */}
      <div className="chat-log" ref={chatLogRef}>
        {console.log("LOG_>", chatLog)}
        {chatLog.length < 1 ? (
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
      <div className="chat-status">{/*status -> is typing etc...*/}</div>
      <div className="chat-close" onClick={closeMessenger}>
        X
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-send"
          placeholder="Type your message..."
          value={message}
          onClick={(e) => setShowEmojiPicker(false)}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              // Calling the sendMessage function when Enter is pressed
              e.preventDefault();

              sendMessage(
                JSON.parse(sessionStorage.getItem("CurrentUser")).UserID,
                selectedFollower.UserId
              );
            }
          }}
          ref={inputRef} // Assign the ref to the input element
        />

        <div
          className="emoji-button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
          }}
        >
          😄
        </div>

        <button
          className="send-button"
          onClick={() => {
            if (showEmojiPicker) setShowEmojiPicker(!showEmojiPicker);
            sendMessage(
              JSON.parse(sessionStorage.getItem("CurrentUser")).UserID,
              selectedFollower.UserId
            );
          }}
        >
          Send
        </button>

        {showEmojiPicker && (
          //   style={{ display: showEmojiPicker ? "block" : "none" }}
          <div className="emoticon-picker">
            <Suspense fallback={<div>Loading...</div>}>
              {/* Lazy load the EmojiPicker component */}
              <LazyEmojiPicker
                skinTonesDisabled={true}
                width="100%"
                height={300}
                onEmojiClick={handleEmojiSelect}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
