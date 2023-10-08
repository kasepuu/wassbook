import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { sendEvent } from "../../websocket";
import "../../css/Chat.css";
import { getLoggedUserFromStorage } from "../..";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
let timeOut;
const Messenger = ({ selectedFollower, closeMessenger }) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const chatLogRef = useRef(null);
  const [chatLog, setChatLog] = useState([]);
  const [messagesToLoad, setMessagesToLoad] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0); // Total number of messages
  const [prevScrollHeight, setScrollHeight] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [shouldResetMessagesToLoad, setShouldResetMessagesToLoad] =
    useState(true);
  const [scrollingEnabled, setScrollingEnabled] = useState(true);
  const LoggedUser = getLoggedUserFromStorage(true, true);
  // get current chat
  useEffect(() => {
    if (shouldResetMessagesToLoad) {
      setMessagesToLoad(10);
      setTotalMessages(0);
      setScrollHeight(0);
      setChatLog([]);
      setShouldResetMessagesToLoad(false);
    }
    if (
      prevScrollHeight === 0 &&
      totalMessages === 0 &&
      messagesToLoad === 10
    ) {
      console.log(
        "INFO HERE",
        selectedFollower,
        prevScrollHeight,
        totalMessages,
        chatLog,
        messagesToLoad
      );
      setShouldResetMessagesToLoad(true);
      loadMessagesFromBackend();
    }
    // eslint-disable-next-line
  }, [selectedFollower, shouldResetMessagesToLoad]);

  function loadMessagesFromBackend() {
    const sender = LoggedUser.UserID;
    const receiver = selectedFollower.UserId;
    const payload = {
      SenderID: sender,
      ReceiverID: receiver,
      Limit: messagesToLoad,
    };
    sendEvent("request_messages", payload);
  }
  // event listener for chat updates
  useEffect(() => {
    // event listener to existing ws connection
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (!localStorage.getItem("CurrentChat")) return
      if (eventData.type === "update_messages") {
        // update the chat log with the received message, only if chat is opened with the right person.
        if (eventData.payload &&
          JSON.parse(localStorage.getItem("CurrentChat")).UserId === eventData.payload.CurrentChat &&
          eventData.payload.ChatLog) {

          setTotalMessages(eventData.payload.TotalCount);
          setChatLog(eventData.payload.ChatLog);
          document.getElementById("chatstatus").innerHTML = "";
        }
      } else if (eventData.type === "is_typing") {
        const chatStatus = document.getElementById("chatstatus");
        if (!chatStatus ||
           selectedFollower.UserName === LoggedUser.UserName ||
           JSON.parse(localStorage.getItem("CurrentChat")).UserId !== eventData.payload.SenderID) {
          return;
        }
        clearTimeout(timeOut);
        let messageformat = `📱${selectedFollower.UserName} is typing...`;
        chatStatus.innerHTML = messageformat;
        timeOut = setTimeout(function () {
          chatStatus.innerHTML = "";
        }, 1000);
      } else {
        //notification
      }
    };
  }, [selectedFollower, LoggedUser]);
  const handleScroll = () => {
    const chatLogContainer = chatLogRef.current;
    if (
      chatLogContainer.scrollTop <= 0 &&
      messagesToLoad <= totalMessages &&
      chatLog.length > 0 &&
      scrollingEnabled
    ) {
      setScrollingEnabled(false);
      setScrollHeight(chatLogContainer.scrollHeight);
      setMessagesToLoad(messagesToLoad + 10); // Load 10 more messages
      loadMessagesFromBackend();
      setTimeout(() => {
        setScrollingEnabled(true);
      }, 500);
    }
  };
  useEffect(() => {
    chatLogRef.current.addEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [messagesToLoad, totalMessages, scrollingEnabled]);
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop =
        chatLogRef.current.scrollHeight - prevScrollHeight; // Adjust scroll position
    }
    if (chatLogRef.current.scrollTop <= 0 && messagesToLoad < totalMessages) {
      loadMessagesFromBackend();
    }
    // eslint-disable-next-line
  }, [chatLog]);
  const sendMessage = (sender, receiver) => {
    if (message.trim() === "") return;
    const payload = {
      Message: convertEmoticonsToEmoji(message),
      SenderID: sender,
      ReceiverID: receiver,
    };
    setMessage("");
    sendEvent("send_message", payload);
  };
  // emoticon functions
  const handleEmojiSelect = (emoji) => {
    setMessage((prevMsg) => prevMsg + emoji.emoji);
  };
  const convertEmoticonsToEmoji = (text) => {
    const emojiDictionary = {
      ":)": "😊",
      ":-)": "😊",
      ":(": "😞",
      ":-(": "😞",
      ":D": "😃",
      ":-D": "😃",
      ":'D": "😂",
      ">D": "😆",
      ":'(": "😭",
      "3:)": "😈",
      "3:(": "👿",
    };
    // emoticon Regex
    const emoticonRegex = /:\)|:-\)|:\(|:-\(|:D|:-D|:'D|>D|:'(|3:)|3:\(/g;
    return text.replace(emoticonRegex, (match) => {
      const emoji = emojiDictionary[match];
      if (emoji) {
        return emoji;
      } else {
        return match;
      }
    });
  };
  return (
    <div className="Messenger">
      <div className="chat-title">📪{selectedFollower.UserName}</div>
      {/* chat-log */}
      <div className="chat-log" ref={chatLogRef}>
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

      <div id="chatstatus" className="chat-status">
        {/*status -> is typing...*/}
      </div>
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
            const response = {
              SenderID: JSON.parse(sessionStorage.getItem("CurrentUser"))
                .UserID,
              ReceiverID: selectedFollower.UserId,
            };
            sendEvent("is_typing", response);
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
          <div className="emoticon-picker">
            <Suspense fallback={<div>Loading...</div>}>
              {/* Lazy load the EmojiPicker component */}
              <LazyEmojiPicker
                skinTonesDisabled={true}
                width="300px"
                height={400}
                onEmojiClick={handleEmojiSelect}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};
export default Messenger;
