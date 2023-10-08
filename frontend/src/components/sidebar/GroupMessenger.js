import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { sendEvent } from "../../websocket";
import { getLoggedUserFromStorage } from "../..";
import "../../css/Chat.css";
// import EmojiPicker from "emoji-picker-react";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
let timeOut;

const GroupMessenger = ({ selectedChat, closeGroupMessenger }) => {
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
      setShouldResetMessagesToLoad(true);
      loadMessagesFromBackend();
    }
    // eslint-disable-next-line
  }, [selectedChat, shouldResetMessagesToLoad]);

  function loadMessagesFromBackend() {
    const sender = getLoggedUserFromStorage(true, true).UserID;
    const openedChatID = selectedChat.GroupID;
    const payload = {
      UserID: sender,
      ReceiverID: selectedChat.OtherMembers,
      OpenedChatID: openedChatID,
      Limit: messagesToLoad,
    };
    sendEvent("request_group_messages", payload);
  }

  // event listener for chat updates
  useEffect(() => {
    // event listener to existing ws connection
    window.socket.onmessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (!localStorage.getItem("CurrentChat")) return
      if (eventData.type === "update_group_messages") {
        // update the chat log with the received message, only if chat is opened with the right person.
        if (
          eventData.payload &&
          selectedChat.GroupID ===
            eventData.payload.CurrentChat &&
          eventData.payload.ChatLog
        ) {
          setTotalMessages(eventData.payload.TotalCount);
          setChatLog(eventData.payload.ChatLog);
          document.getElementById("chatstatus").innerHTML = "";
        }
      } else if (eventData.type === "is_typing_group") {
        const chatStatus = document.getElementById("chatstatus");
        if (!chatStatus ||
          eventData.payload.UserID === LoggedUser.UserID ||
          eventData.payload.GroupID !== selectedChat.GroupID) return

        clearTimeout(timeOut);
        let messageformat = `📱${eventData.payload.UserName} is typing...`;
        chatStatus.innerHTML = messageformat;
        timeOut = setTimeout(function () {
          chatStatus.innerHTML = "";
        }, 1000);
      } else {
        //notification
      }
    };
  }, [selectedChat, LoggedUser]);

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

  const sendMessage = (sender, receivers, GroupID) => {
    if (message.trim() === "") return;

    const payload = {
      Message: convertEmoticonsToEmoji(message),
      UserID: sender,
      ReceiverIDs: receivers,
      GroupID: GroupID,
    };
    setMessage("");
    sendEvent("send_group_message", payload);
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
      <div className="chat-title">📪{selectedChat.GroupName}</div>
      {/* chat-log */}
      <div className="chat-log" ref={chatLogRef}>
        {chatLog.length < 1 ? (
          <div className="empty-chat-message">
            Say hi to {selectedChat.GroupName} group!
          </div>
        ) : (
          chatLog.map((message, index) => (
            <div
              key={index}
              className={`chat-log-${
                message.SenderID === selectedChat.UserId ? "from" : "to"
              }`}
            >
              <div className="chat-log-content">
                <div className="chat-log-to-image">{message.UserName}</div>
                <div className="chat-log-to-message">{message.Message}</div>
              </div>
              <div className="chat-log-to-date">
                {message.UserName === selectedChat.UserName
                  ? `Received on: ${message.Date}`
                  : `Sent on: ${message.Date}`}
              </div>
            </div>
          ))
        )}
      </div>
      {/*other chat elements*/}
      <div id="chatstatus" className="chat-status">
        {/*status -> is typing etc...*/}
      </div>
      <div className="chat-close" onClick={closeGroupMessenger}>
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
              SenderID: LoggedUser.UserID,
              ReceiverIDs: selectedChat.OtherMembers,
              UserName: LoggedUser.UserName,
              GroupID: selectedChat.GroupID
            };
            sendEvent("is_typing_group", response);

            if (e.key === "Enter" && !e.shiftKey) {
              // Calling the sendMessage function when Enter is pressed
              e.preventDefault();

              sendMessage(
                LoggedUser.UserID,
                selectedChat.OtherMembers,
                selectedChat.GroupID
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
              LoggedUser.UserID,
              selectedChat.OtherMembers,
              selectedChat.GroupID
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

export default GroupMessenger;
