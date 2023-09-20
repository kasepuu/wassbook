import { FaAd } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaAngry } from "react-icons/fa";
import Advertisement1 from "../../page-images/advertisement.png";
import { useEffect, useState } from "react";
import { sendEvent } from "../../websocket";
const SidebarRight = () => {
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const [followingList, setFollowingList] = useState([])
  const [followersList, setFollowersList] = useState([])
  const user = JSON.parse(sessionStorage.getItem("CurrentUser"));
  useEffect(() => {
    const sender = user.UserID;
    const payload = {
      SenderID: sender,
    };
    sendEvent("getProfile_followerslist", payload);
  }, []);

  useEffect(() => {
    const handleWebSocketMessage = (e) => {
      const eventData = JSON.parse(e.data);
      if (eventData.type === "profile_followerslist") {
        console.log("EVENT RECEIVED in Sidebar: profile_followerslist");
        setFollowersList(eventData.payload);
      }
      if (eventData.type === "profile_followinglist") {
        console.log("EVENT RECEIVED in Sidebar: profile_followerslist");
        setFollowingList(eventData.payload);
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
  return (
    <>
      {parts.length >= 2 && parts[1] === "profile" && parts[2] === user.UserName ? (
        <>
          <div className="Sidebar">
            <h2>You are following:</h2>
            {followingList &&
              followingList.map(element => (
                <p key={element.UserId}>{element.UserName}</p>
              ))
            }
            <h2>Following you:</h2>
            {followersList &&
              followersList.map(element => (
                <p key={element.UserId}>{element.UserName}</p>
              ))
            }
          </div>
        </>) : (
        <>
          <div className="Sidebar">
            <div className="ad-container">
              <h2>Ads</h2>
              <FaAd /> advertisement
              <img src={Advertisement1} className="ad1" alt="advertisement" />
            </div>

            <div className="sidebar-content">
              <h2>Sidebar content</h2>
              <h3>Games</h3>
              <FaAngry />
              <Link to="/game-1"> päkapikk ja kuri koll</Link>
            </div>
          </div></>)}
    </>
  );
};

export default SidebarRight;
